from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


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
