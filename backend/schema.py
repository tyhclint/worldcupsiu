from datetime import datetime
from typing import Dict, List, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


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
    "R32_MATCH_1", "R32_MATCH_2", "R32_MATCH_3", "R32_MATCH_4",
    "R32_MATCH_5", "R32_MATCH_6", "R32_MATCH_7", "R32_MATCH_8",
    "R32_MATCH_9", "R32_MATCH_10", "R32_MATCH_11", "R32_MATCH_12",
    "R32_MATCH_13", "R32_MATCH_14", "R32_MATCH_15", "R32_MATCH_16",

    "R16_MATCH_1", "R16_MATCH_2", "R16_MATCH_3", "R16_MATCH_4",
    "R16_MATCH_5", "R16_MATCH_6", "R16_MATCH_7", "R16_MATCH_8",

    "QF_MATCH_1", "QF_MATCH_2", "QF_MATCH_3", "QF_MATCH_4",

    "SF_MATCH_1", "SF_MATCH_2",

    "FINAL",
]


class GroupPlacements(BaseModel):
    model_config = ConfigDict(extra="forbid")

    first: UUID
    second: UUID
    third: UUID

    @model_validator(mode="after")
    def teams_must_be_unique(self) -> "GroupPlacements":
        teams = [self.first, self.second, self.third]
        if len(set(teams)) != len(teams):
            raise ValueError("A team cannot appear in multiple group placements")
        return self


class BracketDataSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")

    group_stage: Dict[GroupKey, GroupPlacements]
    wildcards: List[UUID] = Field(min_length=8, max_length=8)
    knockouts: Dict[KnockoutMatchKey, UUID]

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
    def wildcards_must_be_unique(cls, value: List[UUID]) -> List[UUID]:
        if len(set(value)) != len(value):
            raise ValueError("Wildcard teams must be unique")
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
