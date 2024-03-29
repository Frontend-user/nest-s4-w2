import {UserResponseType} from "../users/types/users.types";

export class CommonResponseFabric {
    static createAndGetResponse<T>(Queries: any, items: T[], totalCount: number, some): UserResponseType {
        let changeItems = items.map((b: T) => some.toView(b));
        const pagesCount = Math.ceil(totalCount / Queries.newPageSize);

        return {
            pagesCount: pagesCount,
            page: Queries.newPageNumber,
            pageSize: Queries.newPageSize,
            totalCount: totalCount,
            items: changeItems,
        };
    }

}