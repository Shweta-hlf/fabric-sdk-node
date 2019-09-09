/**
 * Copyright 2019 IBM All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

const rewire = require('rewire');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const should = chai.should();
chai.use(chaiAsPromised);

const User = rewire('../lib/User');
const TestUtils = require('./TestUtils');

describe('User', () => {
	TestUtils.setCryptoConfigSettings();
	const cert = TestUtils.certificateAsPEM;
	const key = TestUtils.keyAsPEM;

	describe('#constructor', () => {
		it('should work using a string', () => {
			const user = new User('user');
			user._name.should.be.equal('user');
		});
		it('should work using a config with name', () => {
			const user = new User({
				name: 'user'
			});
			user._name.should.be.equal('user');
		});
		it('should work using a config with enrollment and roles', () => {
			const user = new User({
				enrollmentID: 'user',
				roles: ['role1', 'role2']
			});
			user._name.should.be.equal('user');
			user._roles.should.be.deep.equal(['role1', 'role2']);
		});
	});

	describe('#setters and getters', () => {
		it('should run', () => {
			const user = new User('user');
			const name = user.getName();
			name.should.be.equal('user');
			user.setRoles(['a', 'b']);
			const roles = user.getRoles();
			roles.should.be.deep.equal(['a', 'b']);
			user.setAffiliation('af');
			const af = user.getAffiliation();
			af.should.be.equal('af');
			user.setSigningIdentity('id');
			const id = user.getIdentity();
			id.should.be.equal('id');
			const sid = user.getSigningIdentity();
			sid.should.be.equal('id');
			user.setCryptoSuite('cs');
			const cs = user.getCryptoSuite();
			cs.should.be.equal('cs');
		});
	});

	describe('#setEnrollment', () => {
		it('should require a private key', async () => {
			const user = new User('user');
			await user.setEnrollment().should.be.rejectedWith(/Invalid parameter. Must have a valid private key./);
		});
		it('should require a certificate', async () => {
			const user = new User('user');
			await user.setEnrollment(key).should.be.rejectedWith(/Invalid parameter. Must have a valid certificate./);
		});
		it('should require a mspid', async () => {
			const user = new User('user');
			await user.setEnrollment(key, cert).should.be.rejectedWith(/Invalid parameter. Must have a valid mspId./);
		});
		it('should require a mspid', async () => {
			const user = new User('user');
			await user.setEnrollment(key, cert, 'mspid', true);
		});
	});

	describe('#isEnrolled', () => {
		it('should return true', () => {
			const user = User.createUser('user', 'password', 'mspid', cert, key);
			const ise = user.isEnrolled();
			ise.should.be.true;
		});
		it('should return false', () => {
			const user = new User('user');
			const ise = user.isEnrolled();
			ise.should.be.false;
		});
	});

	describe('#fromString', () => {
		it('should require a chaincodeName', async () => {
			const user = User.createUser('user', 'password', 'mspid', cert, key);
			const string = user.toString();
			const f_user = new User('fake');
			await f_user.fromString(string).should.be.rejectedWith(/name mismatch:/);
		});
		// it('should build user from other user string', async () => {
		// 	const user = User.createUser('user', 'password', 'mspid', cert, key);
		// 	const string = user.toString();
		// 	const f_user = new User('user');
		// 	f_user.fromString(string, true);
		// 	await f_user._name.should.be.equal('user');
		// });
	});

	describe('#toString', () => {
		it('should return string', () => {
			const user = new User('user');
			const string = user.toString();
			should.equal(string,
				'{"name":"user","mspid":"","roles":null,"affiliation":"","enrollmentSecret":"","enrollment":{}}');
		});
	});
});