export const mapCategory = (dto = {}) => ({
  id: dto.id ?? dto.Id ?? dto.categoryId ?? dto.CategoryId,
  name: dto.name ?? dto.Name ?? dto.naziv ?? dto.Naziv ?? "",
});
