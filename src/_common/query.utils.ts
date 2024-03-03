import { SortOrder } from 'mongoose';

export class QueryUtilsClass {
  static getPagination(
    pageNumber?: number,
    pageSize?: number,
    sortBy?: string,
    sortDirection?: string,
  ) {
    const newPageNumber = pageNumber ?? 1;
    const newPageSize = pageSize ?? 10;
    const skip = (newPageNumber - 1) * newPageSize;
    const limit = newPageSize;

    const newSortBy = sortBy ?? 'createdAt';
    const newSortDir = sortDirection ?? 'desc';
    const sortParams = {};
    sortParams[newSortBy] = newSortDir;

    return {
      skip,
      limit,
      newPageNumber,
      newPageSize,
      sortParams,
    };
  }

  static __getUserSortingOR(searchLoginTerm?: string, searchEmailTerm?: string) {
    let findQuery: any = {};
    if (searchLoginTerm || searchEmailTerm) {
      findQuery = {
        $or: [
          {
            'accountData.login': {
              $regex: String(searchLoginTerm),
              $options: 'i',
            },
          },
          { 'accountData.email': { $regex: String(searchEmailTerm), $options: 'i' } },
        ],
      };
    }
    return findQuery;
  }

  static __getUserSorting(sortBy?: string, sortDirection?: any | string) {
    const sortQuery: any = { 'accountData.createdAt': -1 };
    if (sortBy) {
      delete sortQuery['accountData.createdAt'];
      sortQuery[`accountData.${sortBy}`] = sortDirection === 'asc' ? 1 : -1;
    }
    if (sortDirection && !sortBy) {
      sortQuery['accountData.createdAt'] = sortDirection === 'asc' ? 1 : -1;
    }
    return sortQuery;
  }
}

// [string, SortOrder][]
export type SortParamsModel = { [key: string]: SortOrder };
