namespace Quiz.Application.Feature.Admin.Categories.Commands
{
    public class UpdateCategoryRequest
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
