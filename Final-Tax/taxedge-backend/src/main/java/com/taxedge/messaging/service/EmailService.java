package com.taxedge.messaging.service;

public interface EmailService {
	
	public void sendWelcomeEmail(String toEmail, String name, String custId);

	void sendRegistrationEmail(String toEmail, String recipientName);

}
