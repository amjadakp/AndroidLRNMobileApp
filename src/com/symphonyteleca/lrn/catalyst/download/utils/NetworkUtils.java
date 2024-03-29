package com.symphonyteleca.lrn.catalyst.download.utils;

import java.util.UUID;

import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;

public final class NetworkUtils {

	public static boolean isNetworkAvailable(Context context) {
//		ConnectivityManager connectivity = (ConnectivityManager) context
//				.getSystemService(Context.CONNECTIVITY_SERVICE);
//		if (connectivity == null) {
//			return false;
//		} else {
//			NetworkInfo[] info = connectivity.getAllNetworkInfo();
//			if (info != null) {
//				for (int i = 0; i < info.length; i++) {
//					if (info[i].getState() == NetworkInfo.State.CONNECTED
//							|| info[i].getState() == NetworkInfo.State.CONNECTING) {
//						return true;
//					}
//				}
//			}
//		}
//		return false;
		
		
		return true;
	}

	public static String getFileNameFromUrl(String url) {

		int index = url.lastIndexOf('?');
		String filename;
		if (index > 1) {
			filename = url.substring(url.lastIndexOf('/') + 1, index);
		} else {
			filename = url.substring(url.lastIndexOf('/') + 1);
		}

		if (filename == null || "".equals(filename.trim())) {

			filename = UUID.randomUUID() + ".zip";
		}
		return filename;
	}
}
