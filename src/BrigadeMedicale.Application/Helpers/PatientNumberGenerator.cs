using BrigadeMedicale.Application.Interfaces.Repositories;

namespace BrigadeMedicale.Application.Helpers;

public static class PatientNumberGenerator
{
    public static async Task<string> GenerateAsync(IPatientRepository repository, int year)
    {
        var prefix = $"BM-{year}-";

        // Récupérer le dernier patient de l'année
        var patients = await repository.SearchAsync(prefix, 1, 1000);
        var lastPatient = patients
            .Where(p => p.PatientNumber.StartsWith(prefix))
            .OrderByDescending(p => p.PatientNumber)
            .FirstOrDefault();

        int nextSequence = 1;

        if (lastPatient != null)
        {
            var lastNumber = lastPatient.PatientNumber.Replace(prefix, "");
            if (int.TryParse(lastNumber, out int lastSequence))
            {
                nextSequence = lastSequence + 1;
            }
        }

        return $"{prefix}{nextSequence:D5}";
    }
}
