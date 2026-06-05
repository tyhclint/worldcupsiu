from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator


PlayerPosition = Literal["Goalkeeper", "Defender", "Midfielder", "Attacker"]


class ApiSportsSquadParameters(BaseModel):
    model_config = ConfigDict(extra="ignore")

    team: str


class ApiSportsPaging(BaseModel):
    model_config = ConfigDict(extra="ignore")

    current: int
    total: int


class ApiSportsTeam(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: int
    name: str
    logo: str


class ApiSportsPlayer(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: int
    name: str
    age: int | None = None
    number: int | None = None
    position: PlayerPosition
    photo: str


class ApiSportsSquad(BaseModel):
    model_config = ConfigDict(extra="ignore")

    team: ApiSportsTeam

    
    players: list[ApiSportsPlayer]


class ApiSportsSquadsResponse(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    endpoint: str = Field(alias="get")
    parameters: ApiSportsSquadParameters
    errors: list[object] = Field(default_factory=list)
    results: int
    paging: ApiSportsPaging
    response: list[ApiSportsSquad]


class FantasyFormation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    defenders: int
    midfielders: int
    forwards: int


class FantasySelectedPlayer(ApiSportsPlayer):
    model_config = ConfigDict(extra="forbid")

    country_code: str
    team_id: int


class FantasySquadSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    formation: FantasyFormation
    starters: dict[str, FantasySelectedPlayer]
    bench: dict[str, FantasySelectedPlayer]

    @model_validator(mode="after")
    def enforce_squad_limits(self) -> "FantasySquadSchema":
        players = list(self.starters.values()) + list(self.bench.values())

        player_ids = [player.id for player in players]
        if len(player_ids) != len(set(player_ids)):
            raise ValueError("Duplicate players are not allowed")

        team_counts: dict[int, int] = {}
        for player in players:
            team_counts[player.team_id] = team_counts.get(player.team_id, 0) + 1

        if any(count > 2 for count in team_counts.values()):
            raise ValueError("A squad can include at most 2 players from the same team")

        return self


class SaveFantasySquadRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    fantasy_squad: FantasySquadSchema


class FantasyPlayerRating(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: int
    name: str
    rating: float | None = None


class FantasyScoreResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    score: float | None
    players: list[FantasyPlayerRating]
