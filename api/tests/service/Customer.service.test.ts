import { describe } from "mocha";
import * as chai from 'chai';
import sinon from 'sinon';
import chaiAsPromised from 'chai-as-promised';
import { customerService } from '../../src/service/Customer.service';
import { NotFound } from "../../src/model/error/NotFound";
import { ResourceConflict } from "../../src/model/error/ResourceConflict";
import { docClient } from '../../src/util/awsUtil';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Customer Service', () => {
    beforeEach(() => {
        sinon.restore();
    });
  it('getCustomer: customer not found error', async () => {
    const customerId = 'asdaff-323423-sfdsfds-342sdfs';
    sinon.replace(docClient, 'send', sinon.fake.resolves({}));
    expect(customerService.getCustomer(customerId)).to.be.rejectedWith(NotFound, 'Customer with [ customerId: ' + customerId + ' ] not found.');
  });

  it('getCustomer: get customer metadata', async () => {
    const customerId = 'asdaff-323423-sfdsfds-342sdfs';
    const customerMetadata = {
        customerId,
        firstname: 'firstN', 
        lastname: 'lastN',
        version: 1
    };
    sinon.replace(docClient, 'send', sinon.fake.resolves({
        Item: {
            Metadata: customerMetadata,
            Version: customerMetadata.version
        }
    }));
    const getCustomerResponse = await customerService.getCustomer(customerId);
    expect(getCustomerResponse).to.eql(customerMetadata);
  });

  it('updateCustomer: customer not found error', async () => {
    const customerId = 'asdaff-323423-sfdsfds-342sdfs';
    const customerMetadata = {
        customerId,
        firstname: 'firstN', 
        lastname: 'lastN',
        version: 1
    };
    sinon.replace(docClient, 'send', sinon.fake.rejects(new Error('The conditional request failed')));
    expect(customerService.updateCustomer(customerId, customerMetadata)).to.be.rejectedWith(NotFound, 'Customer with [ customerId: ' + customerId + ' ] not found.');
  });

  it('updateCustomer: optimistic locking error', async () => {
    const customerId = 'asdaff-323423-sfdsfds-342sdfs';
    const customerMetadata = {
        customerId,
        firstname: 'firstN', 
        lastname: 'lastN',
        version: 1
    };
    sinon.replace(docClient, 'send', sinon.fake.rejects(
      {
        message: 'The conditional request failed',
        Item: {
            Version: {
                N: 2
            }
        }
      }
    ));
    expect(customerService.updateCustomer(customerId, customerMetadata)).to.be.rejectedWith(ResourceConflict, 'State conflict for the Customer record [ customerId: ' + customerId + ' ]');
  });

  it('updateCustomer: update customer metadata', async () => {
    const customerId = 'asdaff-323423-sfdsfds-342sdfs';
    const customerMetadata = {
        customerId,
        firstname: 'firstN', 
        lastname: 'lastN',
        version: 1
    };
    sinon.replace(docClient, 'send', sinon.fake.resolves(
      {
        ...customerMetadata,
        version: customerMetadata.version + 1
      }
    ));
    const updateCustomerResponse = await customerService.updateCustomer(customerId, customerMetadata);
    expect(customerMetadata.customerId).to.equal(updateCustomerResponse.customerId);
    expect(customerMetadata.firstname).to.equal(updateCustomerResponse.firstname);
    expect(customerMetadata.lastname).to.equal(updateCustomerResponse.lastname);
    expect(customerMetadata.version + 1).to.equal(updateCustomerResponse.version);
  });

  it('deleteCustomer: customer not found error', async () => {
    const customerId = 'asdaff-323423-sfdsfds-342sdfs';
    const version = 1;
    sinon.replace(docClient, 'send', sinon.fake.rejects(new Error('The conditional request failed')));
    expect(customerService.deleteCustomer(customerId, version)).to.be.rejectedWith(NotFound, 'Customer with [ customerId: ' + customerId + ' ] not found.');
  });

  it('deleteCustomer: optimistic locking error', async () => {
    const customerId = 'asdaff-323423-sfdsfds-342sdfs';
    const version = 1;
    sinon.replace(docClient, 'send', sinon.fake.rejects({
        message: 'The conditional request failed',
        Item: {
            Version: {
                N: 2
            }
        }
    }));
    expect(customerService.deleteCustomer(customerId, version)).to.be.rejectedWith(ResourceConflict, 'State conflict for the Customer record [ customerId: ' + customerId + ' ]');
  });

  it('deleteCustomer: delete customer metadata', async () => {
    const customerId = 'asdaff-323423-sfdsfds-342sdfs';
    const version = 1;
    sinon.replace(docClient, 'send', sinon.fake.resolves('success'));
    expect(customerService.deleteCustomer(customerId, version)).to.be.fulfilled;
  });

  it('addCustomer: system error', async () => {
    const customerMetadata = {
        firstname: 'firstN', 
        lastname: 'lastN'
    };
    sinon.replace(docClient, 'send', sinon.fake.rejects(new Error('System Error')));
    expect(customerService.addCustomer(customerMetadata)).to.be.rejectedWith(Error, 'System Error');
  });

  it('addCustomer: add customer metadata', async () => {
    const customerMetadata = {
        firstname: 'firstN', 
        lastname: 'lastN'
    };
    sinon.replace(docClient, 'send', sinon.fake.resolves('success'));
    const newCustomerMetadata = await customerService.addCustomer(customerMetadata);
    expect(newCustomerMetadata.customerId).to.exist;
    expect(newCustomerMetadata.version).to.eql(1);
  });

});