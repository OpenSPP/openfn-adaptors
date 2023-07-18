import { MockAgent } from 'undici';
import { fixtures } from './fixtures';

const mockAgent = new MockAgent();

const mockPool = mockAgent.get('https://graph.microsoft.com');

const headers = {
  'content-type': 'application/json',
  Authorization: `Bearer ${fixtures.accessToken}`,
};

const headersWithInvalidToken = {
  'content-type': 'application/json',
  Authorization: `Bearer ${fixtures.invalidToken}`,
};

const headersWithExpiredToken = {
  'content-type': 'application/json',
  Authorization: `Bearer ${fixtures.expiredToken}`,
};

mockPool
  .intercept({
    path: '/v1.0/sites/openfn.sharepoint.com',
    method: 'GET',
    headers: headers,
  })
  .reply(200, fixtures.sitesResponse);

mockPool
  .intercept({
    path: '/v1.0/sites/openfn.sharepoint.com',
    method: 'GET',
    headers: headersWithExpiredToken,
  })
  .reply(401, fixtures.expiredTokenResponse);

mockPool
  .intercept({
    path: '/v1.0/sites/openfn.sharepoint.com',
    method: 'GET',
    headers: headersWithInvalidToken,
  })
  .reply(401, fixtures.invalidTokenResponse);

mockPool
  .intercept({
    path: '/v1.0/sites/root',
    method: 'GET',
    headers: headers,
  })
  .reply(200, fixtures.sitesResponse);

mockPool
  .intercept({
    path: '/v1.0/sites/noAccess',
    method: 'GET',
    headers: headers,
  })
  .reply(400, fixtures.invalidRequestResponse);

mockPool
  .intercept({
    path: '/v1.0/sites/openfn.sharepoint.com/drive',
    method: 'GET',
    headers: headers,
  })
  .reply(200, fixtures.driveResponse);

mockPool
  .intercept({
    path: '/v1.0/drives/b!YXzpkoLwR06bxC8tNdg71m_',
    method: 'GET',
    headers: headers,
  })
  .reply(200, fixtures.driveResponse);

mockPool
  .intercept({
    path: '/v1.0/me/drives',
    method: 'GET',
    headers: headers,
  })
  .reply(200, fixtures.userDrives);

mockPool
  .intercept({
    path: '/v1.0/sites/openfn.sharepoint.com/drives',
    method: 'GET',
    headers: headers,
  })
  .reply(200, fixtures.drivesResponse);

mockPool
  .intercept({
    path: '/v1.0/sites/openfn.sharepoint.com/lists',
    method: 'GET',
    headers: headers,
  })
  .reply(200, fixtures.listsResponse);

mockPool
  .intercept({
    path: '/v1.0/sites/openfn.sharepoint.com/lists/e0cb85e7-6497-4ffb-80b0-49e864bea1cd',
    method: 'GET',
    headers: headers,
  })
  .reply(200, fixtures.sharedDocumentList);

mockPool
  .intercept({
    path: '/v1.0/sites/openfn.sharepoint.com/lists/Documents',
    method: 'GET',
    headers: headers,
  })
  .reply(200, fixtures.sharedDocumentList);

mockPool
  .intercept({
    path: '/v1.0/sites/openfn.sharepoint.com/lists/Documents/items',
    method: 'GET',
    headers: headers,
  })
  .reply(200, fixtures.itemsResponse);

mockPool
  .intercept({
    path: '/v1.0/sites/openfn.sharepoint.com/drive/items/d97073d1-5ee7-4218-97cd-bd4167078516',
    method: 'GET',
    headers: headers,
  })
  .reply(200, fixtures.itemResponse);

mockPool
  .intercept({
    path: '/v1.0/sites/openfn.sharepoint.com/drive/items/d97073d1-5ee7-4218-97cd-bd4167078516/content',
    method: 'GET',
    headers: headers,
  })
  .reply(200, fixtures.itemContent);

mockPool
  .intercept({
    path: '/v1.0/sites/openfn.sharepoint.com/drive/items/d97073d1-5ee7-4218-97cd-bd4167078516?select=id,@microsoft.graph.downloadUrl',
    method: 'GET',
    headers: headers,
  })
  .reply(200, fixtures.itemWithOptions);

export default mockAgent;
