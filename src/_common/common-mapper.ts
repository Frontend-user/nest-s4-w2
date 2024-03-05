import {UsersQueryTransformTypes} from "../users/pipes/users-query-transform-pipe";
import {UserDocumentType} from "../users/domain/users-schema";
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

    arraySort<T>(arrayToSort:T[], sortBy: string = 'createdAt', sortDirection: string = 'desc') {
        return  arrayToSort.slice().sort((a: any, b: any) => {
            if (a[sortBy] < b[sortBy]) {
                return sortDirection === 'asc' ? -1 : 1
            } else if (a[sortBy] > b[sortBy]) {
                return sortDirection === 'asc' ? 1 : -1
            } else {
                return 0
            }
        });
    }
    static createAndGetClearResponse(): UserResponseType {
        return {
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 0,
            items: [],
        };
    }
}