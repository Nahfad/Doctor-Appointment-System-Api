import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { CURRENT_USER_KEY } from "src/utils/constants";

export const CurrentUser = createParamDecorator((data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const payload = request[CURRENT_USER_KEY];
    return payload;
})