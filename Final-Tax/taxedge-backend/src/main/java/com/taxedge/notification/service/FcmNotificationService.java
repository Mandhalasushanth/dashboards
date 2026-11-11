package com.taxedge.notification.service;

public interface FcmNotificationService {
	
	public void sendRegistrationSuccessNotification(String targetDeviceToken, String userName);

	void sendSuccessNotification(String targetDeviceToken, String userName);

	String sendCustomNotification(String targetDeviceToken, String title, String body);

    void sendBroadcast(String title, String body);

    int countRegisteredDevices();
}
