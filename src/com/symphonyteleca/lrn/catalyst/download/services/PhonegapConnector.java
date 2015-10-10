package com.symphonyteleca.lrn.catalyst.download.services;

import java.util.ArrayList;
import java.util.HashMap;

import com.symphonyteleca.lrn.catalyst.download.utils.ConfigUtils;
import com.symphonyteleca.lrn.catalyst.download.utils.MyIntents;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public final class PhonegapConnector extends BroadcastReceiver {

	private PhonegapCallbackListener mListener = null;

	private static HashMap<String, PhonegapCallbackListener> mHaspMap = new HashMap<String, PhonegapCallbackListener>();
	private static Intent downloadIntent = new Intent(
			"com.symphonyteleca.lrn.catalyst.download.services.IDownloadService");

	public static PhonegapConnector getInstance() {
		// TODO Auto-generated method stub
		return new PhonegapConnector();
	}
	
	public static void getDownloadStatus(Context sContext,String url,PhonegapCallbackListener listener) {
		// TODO Auto-generated method stub
		String getString = ConfigUtils.getURL(sContext, url);
		HashMap<String, String> hashMap = ConfigUtils.StringtoMap(getString);
		listener.onStatus(hashMap);
	}

	public static void pauseTask(Context sContext, String url) {
		// TODO Auto-generated method stub
		downloadIntent.putExtra(MyIntents.TYPE, MyIntents.Types.PAUSE);
		downloadIntent.putExtra(MyIntents.URL, url);
		sContext.startService(downloadIntent);
	}

	public static void deleteTask(Context sContext, String path, PhonegapCallbackListener listener) {
		mHaspMap.put(path, listener);
		downloadIntent.putExtra(MyIntents.TYPE, MyIntents.Types.DELETE);
		downloadIntent.putExtra(MyIntents.PATH, path);
		downloadIntent.putExtra(MyIntents.URL, path);
		sContext.startService(downloadIntent);
	}

	public static void cancelTask(Context sContext, String url, PhonegapCallbackListener listener) {
		//mHaspMap.put(url, listener);
		downloadIntent.putExtra(MyIntents.TYPE, MyIntents.Types.CANCEL);
		downloadIntent.putExtra(MyIntents.URL, url);
		sContext.startService(downloadIntent);
	}

	public static void resumeTask(Context sContext, String url, //long totalGlobalSize
			PhonegapCallbackListener listener) {
		mHaspMap.put(url, listener);
		downloadIntent.putExtra(MyIntents.TYPE, MyIntents.Types.RESUME);
		downloadIntent.putExtra(MyIntents.URL, url);
		//downloadIntent.putExtra(MyIntents.SIZE, totalGlobalSize);
		sContext.startService(downloadIntent);
	}

	public static void startTask(Context sContext, String url) {
		// TODO Auto-generated method stub
		downloadIntent.putExtra(MyIntents.TYPE, MyIntents.Types.ADD);
		downloadIntent.putExtra(MyIntents.URL, url);
		sContext.startService(downloadIntent);
	}

	/**
	 * specific to this application
	 * @param sContext
	 * @param Url
	 * @param listener
	 * @return
	 */
	
	public static void startTask(Context sContext, String url,//long totalGlobalSize
			PhonegapCallbackListener listener) {
		// TODO Auto-generated method stub
		mHaspMap.put(url, listener);
		downloadIntent.putExtra(MyIntents.TYPE, MyIntents.Types.ADD);
		downloadIntent.putExtra(MyIntents.URL, url);
		//downloadIntent.putExtra(MyIntents.SIZE, totalGlobalSize);
		sContext.startService(downloadIntent);
	}
	
	public static void startTask(Context sContext, ArrayList<String> url,
			PhonegapCallbackListener listener) {
		// TODO Auto-generated method stub
		addListener(listener, url);
		downloadIntent.putExtra(MyIntents.TYPE, MyIntents.Types.ADDALL);
		downloadIntent.putExtra(MyIntents.URL, url);
		sContext.startService(downloadIntent);
	}
	
	private static void addListener(PhonegapCallbackListener listener,ArrayList<String> urlArrayList)
	{
		for (int i = 0; i < urlArrayList.size(); i++) {
           mHaspMap.put(urlArrayList.get(i), listener);	
		}
	}

	@Override
	public void onReceive(Context context, Intent intent) {

		if (intent != null)
			handleIntent(intent);
	}

	public void handleIntent(Intent intent) {

		HashMap<String, String> hashMap = null;
		hashMap = ConfigUtils.StringtoMap(intent.getStringExtra(MyIntents.MAP));
		String urlString = null;

		int type = hashMap.containsKey(MyIntents.TYPE) ? Integer
				.parseInt(hashMap.get(MyIntents.TYPE)) : -1;

		switch (type) {

		case MyIntents.Types.COMPLETE:

			// Phonegap plugin Method
			// (e.g) onCompletePlugin(hashMap)

			// specfic to this application
			urlString = hashMap.get(MyIntents.URL);
			if (mHaspMap.containsKey(urlString)) {
				mListener = mHaspMap.get(urlString);
				mHaspMap.remove(urlString);
				mListener.onComplete(hashMap);
			}

			break;

		case MyIntents.Types.EXTRACT:

			// Phonegap plugin Method
			// (e.g) onExtractPlugin(hashMap)

			// specfic to this application
			urlString = hashMap.get(MyIntents.URL);
			if (mHaspMap.containsKey(urlString)) {
				mListener = mHaspMap.get(urlString);
				mListener.onExtract(hashMap);
			}
			break;

		case MyIntents.Types.RESUME:
			// (e.g) onContinuePlugin(hashMap)

			// specfic to this application
			urlString = hashMap.get(MyIntents.URL);
			if (mHaspMap.containsKey(urlString)) {
				mListener = mHaspMap.get(urlString);
				mListener.onProgress(hashMap);
			}
			break;

		case MyIntents.Types.EXCEPTION:

			// Phonegap plugin Method
			// (e.g) onExceptionPlugin(hashMap)

			// specfic to this application
			urlString = hashMap.get(MyIntents.URL);
			if (mHaspMap.containsKey(urlString)) {
				mListener = mHaspMap.get(urlString);
				mHaspMap.remove(urlString);
				mListener.onError(hashMap);
			}
			break;
			
		case MyIntents.Types.DELETE:

			// Phonegap plugin Method
			// (e.g) onExceptionPlugin(hashMap)

			// specfic to this application
			urlString = hashMap.get(MyIntents.URL);
			if (mHaspMap.containsKey(urlString)) {
				mListener = mHaspMap.get(urlString);
				mHaspMap.remove(urlString);
				mListener.onDelete(hashMap);
			}
			break;
		default:
			break;
		}
	}
}
