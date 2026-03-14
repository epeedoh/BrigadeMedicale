using '../main.bicep'

param prefix = 'brigademed'
param environment = 'dev'
param location = 'francecentral'

param tags = {
  env: 'dev'
  project: 'BrigadeMedicale'
  owner: 'student'
}

param sqlAdminLogin = 'sqladmin'
// PASSWORD WILL BE PROVIDED AT DEPLOY TIME (interactive prompt)

param apiRuntime = 'DOTNETCORE|8.0'
param sqlMaxCapacity = 1
param sqlMinCapacity = 1
param sqlAutoPauseDelayMinutes = 60
