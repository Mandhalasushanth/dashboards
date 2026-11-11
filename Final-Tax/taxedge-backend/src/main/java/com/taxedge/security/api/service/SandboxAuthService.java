package com.taxedge.security.api.service;

public interface SandboxAuthService {
	
	String getAccessToken();
	String generateNewToken();

}
