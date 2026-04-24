export interface CategoryResponse {
    id: number;
    name: string;
    parent: CategoryResponse | null;
}