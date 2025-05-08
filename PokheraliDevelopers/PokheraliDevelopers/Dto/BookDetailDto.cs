public class BookDetailDto : BookResponseDto
{
    public List<ReviewDto> Reviews { get; set; }
    public List<BookResponseDto> RelatedBooks { get; set; }
}