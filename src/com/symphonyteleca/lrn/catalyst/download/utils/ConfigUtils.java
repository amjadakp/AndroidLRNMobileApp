package com.symphonyteleca.lrn.catalyst.download.utils;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import com.symphonyteleca.lrn.catalyst.download.R;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.text.TextUtils;

public final class ConfigUtils {

	public static final String PREFERENCE_NAME = "com.symphonyteleca.lrn.catalyst.download";


	public static SharedPreferences getPreferences(Context context) {
		return context.getSharedPreferences(PREFERENCE_NAME,
				Context.MODE_WORLD_WRITEABLE);
	}

	public static String getString(Context context, String key) {
		SharedPreferences preferences = getPreferences(context);
		if (preferences != null) {
			return preferences.getString(key, "");
		} else
			return "";
	}

	public static void setString(Context context, String key, String value) {
		SharedPreferences preferences = getPreferences(context);
		if (preferences != null) {
			Editor editor = preferences.edit();
			editor.putString(key, value);
			editor.commit();
		}
	}

	public static void deleteString(Context context, String key) {
		SharedPreferences preferences = getPreferences(context);
		if (preferences != null) {
			Editor editor = preferences.edit();
			editor.remove(key);
			editor.commit();
		}
	}

	public static final int URL_COUNT = 3;
	public static final String KEY_URL = "url";

	public static void storeURL(Context context, String index, String value) {
		setString(context, KEY_URL + index, value);
	}

	public static void clearURL(Context context, String index) {
		setString(context, KEY_URL + index, "");
	}

	public static void deleteURL(Context context, String index) {
		deleteString(context, KEY_URL + index);
	}

	public static String getURL(Context context, String index) {
		return getString(context, KEY_URL + index);
	}

	public static List<String> getURLArray(Context context) {
		List<String> urlList = new ArrayList<String>();
		for (int i = 0; i < URL_COUNT; i++) {
			if (!TextUtils.isEmpty(getURL(context, "" + i))) {
				urlList.add(getString(context, KEY_URL + i));
			}
		}
		return urlList;
	}

	// public static final String KEY_RX_WIFI = "rx_wifi";
	// public static final String KEY_TX_WIFI = "tx_wifi";
	// public static final String KEY_RX_MOBILE = "tx_mobile";
	// public static final String KEY_TX_MOBILE = "tx_mobile";
	// public static final String KEY_Network_Operator_Name = "operator_name";

	public static int getInt(Context context, String key) {
		SharedPreferences preferences = getPreferences(context);
		if (preferences != null)
			return preferences.getInt(key, 0);
		else
			return 0;
	}

	public static void setInt(Context context, String key, int value) {
		SharedPreferences preferences = getPreferences(context);
		if (preferences != null) {
			Editor editor = preferences.edit();
			editor.putInt(key, value);
			editor.commit();
		}
	}

	public static long getLong(Context context, String key) {
		SharedPreferences preferences = getPreferences(context);
		if (preferences != null)
			return preferences.getLong(key, 0L);
		else
			return 0L;
	}

	public static void setLong(Context context, String key, long value) {
		SharedPreferences preferences = getPreferences(context);
		if (preferences != null) {
			Editor editor = preferences.edit();
			editor.putLong(key, value);
			editor.commit();
		}
	}

	public static void addLong(Context context, String key, long value) {
		setLong(context, key, getLong(context, key) + value);
	}
	
	public static HashMap<String, String> StringtoMap(String s) {
		HashMap<String, String> map = new HashMap<String, String>();
		if (s != null && s.length() > 2) {
			s = s.substring(1, s.length() - 1);
			for (final String entry : s.split(",")) {
				final String[] parts = entry.split("=",2);
				//assert (parts.length == 2) : "Invalid entry: " + entry;
				if (parts.length == 2)
					map.put((parts[0].trim()), parts[1].trim());
				else
					map.put((parts[0].trim()), "");
			}
		}
		return map;
	}
	
//	/**
//  * Convert a second duration to a string format
//  * @param context Context for get resource string
//  * @param millis A duration to convert to a string form
//  * @return A string of the form "X Days Y Hours Z Minutes A Seconds".
//  */
 public static String getDurationBreakdown(Context context,long millis)
 { 	
	 String text="";
	 if(millis>0){
 	 	String emptyString ="";
		int totalSeconds = (int) millis/1000; // keep a copy of original seconds
		int hours = totalSeconds / (60 * 60);
		totalSeconds = totalSeconds % (60 * 60); // modulo (remainder after division)
		int minutes = totalSeconds / 60;
		totalSeconds = totalSeconds % 60;
		String Totalhour = hours != 0 ? hours + " hrs" : emptyString;// integer/integer = integer
		String Totalmins = minutes != 0 ? minutes + " minutes" : emptyString;
		String Totalsec =  minutes == 0 && hours == 0 ?totalSeconds==0?"1 second":totalSeconds+" seconds":emptyString;   
		text = String.format(context.getResources().getString(R.string.download_time),Totalhour,Totalmins,Totalsec);
	 }
     return text;
 }

}
