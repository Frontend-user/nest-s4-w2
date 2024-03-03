import {IsString, Length} from "class-validator";

export type AccessRefreshTokens = {
    accessToken:string
    refreshToken:string
}
export class LoginOrEmailPasswordClass  {
    @Length(3)
    @IsString()
    loginOrEmail: String

    @IsString()
    @Length(6,20)
    password: String
}
export class LoginOrEmailPasswordModel  {
    @Length(3)
    @IsString()
    loginOrEmail: String

    @IsString()
    @Length(6,20)
    password: String
}