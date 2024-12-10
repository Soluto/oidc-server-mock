using Microsoft.Extensions.FileProviders;
using OpenIdConnectServer;
using OpenIdConnectServer.Helpers;
using OpenIdConnectServer.JsonConverters;
using OpenIdConnectServer.Services;
using OpenIdConnectServer.Validation;
using Serilog;
using Serilog.Events;
using Serilog.Sinks.SystemConsole.Themes;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Debug()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.Hosting.Lifetime", LogEventLevel.Information)
    .MinimumLevel.Override("System", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.AspNetCore.Authentication", LogEventLevel.Information)
    .Enrich.FromLogContext()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level}] {SourceContext}{NewLine}{Message:lj}{NewLine}{Exception}{NewLine}", theme: AnsiConsoleTheme.Code)
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
builder.Host.UseSerilog();

// Add services to the container.
builder.Services.AddRazorPages();

builder.Services
    .AddControllersWithViews()
    .AddNewtonsoftJson(options =>
        {
            options.SerializerSettings.Converters.Add(new ClaimJsonConverter());
        });

builder.Services
    .AddIdentityServer(options =>
        {
            var configuredOptions = Config.GetServerOptions();
            MergeHelper.Merge(configuredOptions, options);
        })
    .AddDeveloperSigningCredential()
    .AddInMemoryIdentityResources(Config.GetIdentityResources())
    .AddInMemoryApiResources(Config.GetApiResources())
    .AddInMemoryApiScopes(Config.GetApiScopes())
    .AddInMemoryClients(Config.GetClients())
    .AddTestUsers(Config.GetUsers())
    .AddRedirectUriValidator<RedirectUriValidator>()
    .AddProfileService<ProfileService>()
    .AddCorsPolicyService<CorsPolicyService>();

var app = builder.Build();

app.UsePathBase(Config.GetAspNetServicesOptions().BasePath);

var aspNetServicesOptions = Config.GetAspNetServicesOptions();
AspNetServicesHelper.ConfigureAspNetServices(builder.Services, aspNetServicesOptions);
AspNetServicesHelper.UseAspNetServices(app, aspNetServicesOptions);

Config.ConfigureOptions<IdentityServerHost.Pages.Login.LoginOptions>("LOGIN");
Config.ConfigureOptions<IdentityServerHost.Pages.Logout.LogoutOptions>("LOGOUT");

app.UseDeveloperExceptionPage();

app.UseIdentityServer();

app.UseHttpsRedirection();

var manifestEmbeddedProvider = new ManifestEmbeddedFileProvider(typeof(Program).Assembly, "wwwroot");
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = manifestEmbeddedProvider
});

app.UseRouting();

app.UseAuthorization();
app.UseEndpoints(endpoints =>
    {
        endpoints.MapDefaultControllerRoute();
    });

app.MapRazorPages();

app.Run();
