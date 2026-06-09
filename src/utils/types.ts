import { UserType } from "./enums";

export type JWTPayloadType = {
    id: number;
    userType: UserType
}