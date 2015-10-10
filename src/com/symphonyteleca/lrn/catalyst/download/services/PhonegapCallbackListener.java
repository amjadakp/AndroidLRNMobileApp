
package com.symphonyteleca.lrn.catalyst.download.services;

import java.util.HashMap;

public interface PhonegapCallbackListener {
	
	public void onStatus(HashMap<String, String> task);
	
	public void onProgress(HashMap<String, String> task);
	
	public void onComplete(HashMap<String, String> task);
	
	public void onError(HashMap<String, String> task);
	
	public void onExtract(HashMap<String, String> task);
	
	public void onDelete(HashMap<String, String> task);
	
}
