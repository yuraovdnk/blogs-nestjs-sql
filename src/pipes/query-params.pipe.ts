import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { SortFieldsBlogModel } from '../features/blogs/typing/blogs.types';

export interface IQueryParams {
  searchNameTerm: string;

  searchLoginTerm: string;

  searchEmailTerm: string;

  pageNumber: string;

  pageSize: string;

  sortDirection: string;

  sortBy: string;
}

@Injectable()
export class QueryParamsDto {
  searchNameTerm = '';

  searchLoginTerm = '';

  searchEmailTerm = '';

  @Transform(({ value }) => {
    const num = parseInt(value);
    if (isNaN(num)) return 1;
    return num;
  })
  pageNumber = 1;

  @Transform(({ value }) => {
    const num = parseInt(value);
    if (isNaN(num)) return 10;
    return num;
  })
  pageSize = 10;

  @IsEnum({ asc: 'asc', desc: 'desc' }, { each: true })
  @IsOptional()
  sortDirection = 'desc';

  sortBy: string;
}

@Injectable()
export class QueryParamsPipe implements PipeTransform {
  constructor(private Model: any) {}
  public async transform(value: IQueryParams) {
    const checkSortField = this.Model.hasOwnProperty(value.sortBy);
    const sortBy = checkSortField ? value.sortBy : 'createdAt';
    //TODO exception!!!!
    value.sortBy = sortBy;
    return value;
  }
}
