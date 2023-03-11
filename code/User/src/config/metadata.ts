/**
 * @description Metadata configuration for this service.
 */
export const metadataConfig: Record<string, any> = {
  version: 1,
  lifecycleStage: 'production',
  owner: 'MyCompany',
  hostPlatform: 'aws',
  domain: 'UserManagement',
  system: 'UserStore',
  //service: 'User',
  team: 'ThatOtherTeam',
  tags: ['backend', 'typescript'],
  dataSensitivity: 'sensitive'
};
