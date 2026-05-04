var password = "Admin123*";

var hash = BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);

Console.WriteLine(hash);
