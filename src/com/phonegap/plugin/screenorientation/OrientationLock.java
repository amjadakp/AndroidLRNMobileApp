package com.phonegap.plugin.screenorientation;

import org.json.JSONArray;
import org.json.JSONException;
import android.content.pm.ActivityInfo;
import org.apache.cordova.api.CallbackContext;
import org.apache.cordova.api.CordovaPlugin;
import org.apache.cordova.api.PluginResult;

/**
 * 
 * Android Phonegap Plugin for locking/unlocking the orientation from JS code
 * 
 */
public class OrientationLock extends CordovaPlugin {

	private static final String UNSPECIFIED = "unspecified";
	private static final String LANDSCAPE = "landscape";
	private static final String PORTRAIT = "portrait";
	private static final String USER = "user";
	private static final String BEHIND = "behind";
	private static final String SENSOR = "sensor";
	private static final String NOSENSOR = "nosensor";
	private static final String SENSOR_LANDSCAPE = "sensorLandscape";
	private static final String SENSOR_PORTRAIT = "sensorPortrait";
	private static final String REVERSE_LANDSCAPE = "reverseLandscape";
	private static final String REVERSE_PORTRAIT = "reversePortrait";
	private static final String FULL_SENSOR = "fullSensor";

	public OrientationLock() {
	}

	public void unlock() {
		cordova.getActivity().setRequestedOrientation(
				ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED);
	}

	public void lock(String orientation) {
		if (orientation.equals(PORTRAIT))
			cordova.getActivity().setRequestedOrientation(
					ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
		else
			cordova.getActivity().setRequestedOrientation(
					ActivityInfo.SCREEN_ORIENTATION_LANDSCAPE);
	}

	@Override
	// public PluginResult execute(String action, JSONArray arguments, String
	// callbackId) {
	public boolean execute(String action, JSONArray arguments,
			CallbackContext callBackId) {
		if (action.equals("lock")) {

			try {
				String orientation = arguments.getString(0);

				if (orientation != null
						&& (orientation.equals(LANDSCAPE) || orientation
								.equals(PORTRAIT))) {
					this.lock(orientation);
					callBackId.success();
					return true;
				} else {
					return false;
				}

			} catch (JSONException e) {
				return false;
			}

		} else if (action.equals("unlock")) {
			this.unlock();
			callBackId.success();
			return true;
		} else {
			return false;
		}
	}
}
