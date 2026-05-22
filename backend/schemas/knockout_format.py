from datetime import datetime
from typing import Dict, List, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


TeamId = str

GroupKey = Literal[
    "Group_A",
    "Group_B",
    "Group_C",
    "Group_D",
    "Group_E",
    "Group_F",
    "Group_G",
    "Group_H",
    "Group_I",
    "Group_J",
    "Group_K",
    "Group_L",
]

EXPECTED_GROUPS: set[str] = {
    "Group_A",
    "Group_B",
    "Group_C",
    "Group_D",
    "Group_E",
    "Group_F",
    "Group_G",
    "Group_H",
    "Group_I",
    "Group_J",
    "Group_K",
    "Group_L",
}

KnockoutMatchKey = Literal[
    "M73",
    "M74",
    "M75",
    "M76",
    "M77",
    "M78",
    "M79",
    "M80",
    "M81",
    "M82",
    "M83",
    "M84",
    "M85",
    "M86",
    "M87",
    "M88",
    "M89",
    "M90",
    "M91",
    "M92",
    "M93",
    "M94",
    "M95",
    "M96",
    "M97",
    "M98",
    "M99",
    "M100",
    "M101",
    "M102",
    "M104",
]

EXPECTED_KNOCKOUT_MATCHES: set[str] = {
    "M73",
    "M74",
    "M75",
    "M76",
    "M77",
    "M78",
    "M79",
    "M80",
    "M81",
    "M82",
    "M83",
    "M84",
    "M85",
    "M86",
    "M87",
    "M88",
    "M89",
    "M90",
    "M91",
    "M92",
    "M93",
    "M94",
    "M95",
    "M96",
    "M97",
    "M98",
    "M99",
    "M100",
    "M101",
    "M102",
    "M104",
}


class GroupPlacements(BaseModel):
    model_config = ConfigDict(extra="forbid")

    first: TeamId
    second: TeamId
    third: TeamId

    @model_validator(mode="after")
    def teams_must_be_unique(self) -> "GroupPlacements":
        teams = [self.first, self.second, self.third]
        if len(set(teams)) != len(teams):
            raise ValueError("A team cannot appear in multiple group placements")
        return self


class BracketDataSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    group_stage: Dict[GroupKey, GroupPlacements]
    wildcards: List[TeamId] = Field(min_length=8, max_length=8)
    knockouts: Dict[KnockoutMatchKey, TeamId]

    @field_validator("group_stage")
    @classmethod
    def must_have_all_groups(
        cls,
        value: Dict[GroupKey, GroupPlacements],
    ) -> Dict[GroupKey, GroupPlacements]:
        provided_groups = set(value.keys())
        missing_groups = EXPECTED_GROUPS - provided_groups
        extra_groups = provided_groups - EXPECTED_GROUPS

        if missing_groups:
            raise ValueError(f"Missing group predictions: {sorted(missing_groups)}")
        if extra_groups:
            raise ValueError(f"Unexpected group predictions: {sorted(extra_groups)}")

        return value

    @field_validator("wildcards")
    @classmethod
    def wildcards_must_be_unique(cls, value: List[TeamId]) -> List[TeamId]:
        if len(set(value)) != len(value):
            raise ValueError("Wildcard teams must be unique")
        return value

    @field_validator("knockouts")
    @classmethod
    def must_have_all_knockout_matches(
        cls,
        value: Dict[KnockoutMatchKey, TeamId],
    ) -> Dict[KnockoutMatchKey, TeamId]:
        provided_matches = set(value.keys())
        missing_matches = EXPECTED_KNOCKOUT_MATCHES - provided_matches
        extra_matches = provided_matches - EXPECTED_KNOCKOUT_MATCHES

        if missing_matches:
            raise ValueError(f"Missing knockout predictions: {sorted(missing_matches)}")
        if extra_matches:
            raise ValueError(f"Unexpected knockout predictions: {sorted(extra_matches)}")

        return value


class CreatePredictionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    bracket_data: BracketDataSchema


class UserPredictionSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    bracket_data: BracketDataSchema
    global_score: int
    created_at: datetime
    updated_at: datetime
