namespace BrigadeMedicale.Domain.Exceptions;

public class DomainException : Exception
{
    public string Code { get; }

    public DomainException(string code, string message) : base(message)
    {
        Code = code;
    }
}

public class NotFoundException : DomainException
{
    public NotFoundException(string message) : base("NOT_FOUND", message) { }
}

public class DuplicateException : DomainException
{
    public object? DuplicateData { get; }

    public DuplicateException(string message, object? duplicateData = null)
        : base("DUPLICATE_ENTITY", message)
    {
        DuplicateData = duplicateData;
    }
}

public class BusinessException : DomainException
{
    public BusinessException(string message) : base("BUSINESS_ERROR", message) { }
    public BusinessException(string code, string message) : base(code, message) { }
}

public class UnauthorizedException : DomainException
{
    public UnauthorizedException(string message) : base("UNAUTHORIZED", message) { }
}

public class ValidationException : DomainException
{
    public ValidationException(string message) : base("VALIDATION_ERROR", message) { }
}
