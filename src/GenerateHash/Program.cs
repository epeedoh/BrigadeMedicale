using System;

var password = args.Length > 0 ? args[0] : "admin123";
var hash = BCrypt.Net.BCrypt.HashPassword(password);
Console.WriteLine($"Password: {password}");
Console.WriteLine($"Hash: {hash}");
