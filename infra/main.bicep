targetScope = 'resourceGroup'

@description('Environment prefix')
param prefix string = 'brigademed'

@description('Environment name')
param environment string = 'dev'

@description('Azure region')
param location string = 'francecentral'

@description('Tags applied to all resources')
param tags object = {
  env: environment
  project: 'BrigadeMedicale'
  owner: 'student'
}

@description('SQL Server admin login')
param sqlAdminLogin string = 'sqladmin'

@description('SQL Server admin password')
@secure()
param sqlAdminPassword string

@description('API image/runtime version')
param apiRuntime string = 'DOTNETCORE|8.0'

@description('SQL Serverless max capacity (vCores)')
param sqlMaxCapacity int = 1

@description('SQL Serverless min capacity (vCores)')
param sqlMinCapacity int = 1

@description('SQL auto-pause delay in minutes')
param sqlAutoPauseDelayMinutes int = 60

// ==================== STATIC WEB APP ====================
resource staticWebApp 'Microsoft.Web/staticSites@2023-12-01' = {
  name: '${prefix}-${environment}-swa'
  location: location
  tags: tags
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    provider: 'GitHub'
    repositoryUrl: 'https://github.com/your-repo/BrigadeMedicale' // TODO: update
    branch: 'main'
    buildProperties: {
      appLocation: 'brigade-medicale-frontend'
      outputLocation: 'dist/brigade-medicale-frontend'
    }
  }
}

// ==================== APP SERVICE (API) ====================
resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: '${prefix}-${environment}-asp'
  location: location
  tags: tags
  kind: 'linux'
  sku: {
    name: 'F1'
    tier: 'Free'
  }
  properties: {
    reserved: true
  }
}

resource appService 'Microsoft.Web/sites@2023-12-01' = {
  name: '${prefix}-${environment}-api'
  location: location
  tags: tags
  kind: 'app,linux'
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: apiRuntime
      appSettings: [
        {
          name: 'ASPNETCORE_ENVIRONMENT'
          value: 'Production'
        }
        {
          name: 'ConnectionStrings__DefaultConnection'
          value: 'Server=tcp:${sqlServer.properties.fullyQualifiedDomainName},1433;Initial Catalog=${sqlDatabase.name};Persist Security Info=False;User ID=${sqlAdminLogin};Password=${sqlAdminPassword};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'
        }
        {
          name: 'CORS_ALLOWED_ORIGINS'
          value: 'https://${staticWebApp.properties.defaultHostname}'
        }
      ]
    }
  }
}

// Configure CORS on App Service
resource appServiceCors 'Microsoft.Web/sites/config@2023-12-01' = {
  parent: appService
  name: 'web'
  properties: {
    cors: {
      allowedOrigins: [
        'https://${staticWebApp.properties.defaultHostname}'
        'http://localhost:4200'
      ]
      supportCredentials: true
    }
  }
}

// ==================== AZURE SQL (SERVERLESS) ====================
resource sqlServer 'Microsoft.Sql/servers@2023-08-01-preview' = {
  name: '${prefix}-${environment}-sql'
  location: location
  tags: tags
  properties: {
    administratorLogin: sqlAdminLogin
    administratorLoginPassword: sqlAdminPassword
    publicNetworkAccess: 'Enabled'
  }
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-08-01-preview' = {
  parent: sqlServer
  name: '${prefix}-${environment}-db'
  location: location
  tags: tags
  sku: {
    name: 'GP_S_Gen5'
    tier: 'GeneralPurpose'
  }
  properties: {
    collation: 'SQL_Latin1_General_CP1_CI_AS'
    maxSizeBytes: 2147483648 // 2GB
    zoneRedundant: false
    autoPauseDelay: sqlAutoPauseDelayMinutes
    minCapacity: json('0.5') // Minimum serverless capacity
    computeModel: 'Serverless'
    maintenance: {
      maintenanceWindowEnabled: false
    }
  }
}

// Allow Azure Services to access SQL
resource sqlFirewallAzure 'Microsoft.Sql/servers/firewallRules@2023-08-01-preview' = {
  parent: sqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// ==================== OUTPUTS ====================
@description('Static Web App URL')
output staticWebAppUrl string = 'https://${staticWebApp.properties.defaultHostname}'

@description('API App Service URL')
output apiUrl string = 'https://${appService.properties.defaultHostName}'

@description('SQL Server FQDN')
output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName

@description('SQL Database name')
output sqlDatabaseName string = sqlDatabase.name

@description('SQL Server name')
output sqlServerName string = sqlServer.name

@description('Connection string template (add password manually)')
output connectionStringTemplate string = 'Server=tcp:${sqlServer.properties.fullyQualifiedDomainName},1433;Initial Catalog=${sqlDatabase.name};Persist Security Info=False;User ID=${sqlAdminLogin};Password=<YOUR_PASSWORD>;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;'
