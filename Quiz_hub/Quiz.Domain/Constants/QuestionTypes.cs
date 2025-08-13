namespace Quiz.Domain.Constants
{
    public static class QuestionTypes
    {
        public const string Single = "SingleChoice";
        public const string Multiple = "MultipleChoice";
        public const string TrueFalse = "TrueFalse";
        public const string FillIn = "FillInTheBlank";

        public static readonly string[] All = { Single, Multiple, TrueFalse, FillIn };
    }
}