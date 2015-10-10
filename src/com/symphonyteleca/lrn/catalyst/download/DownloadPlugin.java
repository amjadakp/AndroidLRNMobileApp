package com.symphonyteleca.lrn.catalyst.download;

import java.util.HashMap;

import org.apache.cordova.api.CallbackContext;
import org.apache.cordova.api.CordovaPlugin;
import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.symphonyteleca.lrn.catalyst.download.services.PhonegapCallbackListener;
import com.symphonyteleca.lrn.catalyst.download.services.PhonegapConnector;

import android.util.Log;

public class DownloadPlugin extends CordovaPlugin implements
		PhonegapCallbackListener {

	private static final String LOG_TAG = "DownloadPlugin";

	private CallbackContext gCallbackContext;

	@Override
	public boolean execute(String action, JSONArray data,
			CallbackContext callbackContext) throws JSONException {

		final PhonegapCallbackListener listener = this;
		boolean result = false;

		// Log.d(LOG_TAG, "args: " + data.toString());

		JSONObject jo = new JSONObject(data.toString().substring(1,
				data.toString().length() - 1));
		final String url = (String) jo.get("url");
		gCallbackContext = callbackContext;

		if (action.equals("getStatus")) {

			cordova.getThreadPool().execute(new Runnable() {
				public void run() {
					PhonegapConnector.getDownloadStatus(cordova.getActivity(),
							url, listener);
				}
			});
			result = true;

		} else if (action.equals("start")) {
Log.d("Recieved START for ", url);
			cordova.getThreadPool().execute(new Runnable() {
				public void run() {
					PhonegapConnector.startTask(cordova.getActivity(), url,
							listener);
				}
			});
			result = true;

		} else if (action.equals("pause")) {
			Log.d("Recieved PAUSE for ", url);
			cordova.getThreadPool().execute(new Runnable() {
				public void run() {
					PhonegapConnector.pauseTask(cordova.getActivity(), url);
				}
			});
			result = true;

		} else if (action.equals("resume")) {
			Log.d("Recieved RESUME for ", url);
			cordova.getThreadPool().execute(new Runnable() {
				public void run() {
					PhonegapConnector.resumeTask(cordova.getActivity(), url,
							listener);
				}
			});
			result = true;

		} else if (action.equals("cancel")) {
			Log.d("Recieved CANCEL for ", url);
			cordova.getThreadPool().execute(new Runnable() {
				public void run() {
					PhonegapConnector.cancelTask(cordova.getActivity(), url,
							listener);
				}
			});
			result = true;

		} else if (action.equals("delete")) {

			cordova.getThreadPool().execute(new Runnable() {
				public void run() {
					PhonegapConnector.deleteTask(cordova.getActivity(), url,
							listener);
				}
			});
			result = true;

		}

		if (result) {
			PluginResult pluginResult = new PluginResult(
					PluginResult.Status.NO_RESULT, "");
			pluginResult.setKeepCallback(true);
			gCallbackContext.sendPluginResult(pluginResult);
		}
		return result;
	}

	// Send this JSON data to the JavaScript application.
	public void sendMessage(boolean bSuccess, JSONObject jsonResult) {
		// Log.d(LOG_TAG, "sendMessage: " + jsonResult.toString());

		if (bSuccess) {
			PluginResult result = new PluginResult(PluginResult.Status.OK,
					jsonResult);
			result.setKeepCallback(true);
			gCallbackContext.sendPluginResult(result);
		} else {
			PluginResult result = new PluginResult(PluginResult.Status.ERROR,
					jsonResult);
			result.setKeepCallback(true);
			gCallbackContext.sendPluginResult(result);
		}
	}

	@Override
	public void onProgress(HashMap<String, String> task) {
		// Log.d(LOG_TAG, "onProgress");

		JSONObject json = new JSONObject();
		try {
			int status = Integer.parseInt(task.get("type"));
			if (status == 5) {
				json.put("status", "download");

			} else if (status == 8) {
				json.put("status", "unzip");
			}

			json.put("url", task.get("url"));
			json.put("download_speed", task.get("process_speed"));
			json.put("progress", task.get("process_progress"));
			json.put("filename", task.get("file_name"));
			json.put("filepath", task.get("file_path"));
			json.put("taskName", task.get("taskName"));
			json.put("global_process_speed", task.get("global_process_speed"));
			json.put("global_process_progress",
					task.get("global_process_progress"));

			sendMessage(true, json);
		} catch (JSONException e) {
			// No message is sent to the user, JSON failed
			Log.e(LOG_TAG, "onProgress: " + "JSON exception");
		}
	}

	@Override
	public void onComplete(HashMap<String, String> task) {
		// Log.d(LOG_TAG, "onComplete");
		JSONObject json;
		try {
			if (task.get("taskName").equals("unzipping")) {
				json = new JSONObject().put("status", "unzip completed");
				json.put("url", task.get("url"));
				json.put("taskName", task.get("taskName"));
				json.put("progress", task.get("process_progress"));
				json.put("global_process_speed",
						task.get("global_process_speed"));
				json.put("global_process_progress",
						task.get("global_process_progress"));				
			} else {
				json = new JSONObject().put("status", "finished");
				json.put("url", task.get("url"));
				json.put("download_speed", task.get("process_speed"));
				json.put("progress", task.get("process_progress"));
				json.put("taskName", task.get("taskName"));
				json.put("filename", task.get("file_name"));
				json.put("filepath", task.get("file_path"));
				json.put("global_process_speed",
						task.get("global_process_speed"));
				json.put("global_process_progress",
						task.get("global_process_progress"));
			}

			sendMessage(true, json);
		} catch (JSONException e) {
			// No message is sent to the user, JSON failed
			Log.e(LOG_TAG, "onComplete: " + "JSON exception");
		}

	}

	@Override
	public void onError(HashMap<String, String> task) {
		// Log.d(LOG_TAG, "onError");

		JSONObject json;
		try {
			json = new JSONObject().put("status", "error");
			json.put("url", task.get("url"));
			json.put("error_code", task.get("process_progress"));
			json.put("taskName", task.get("taskName"));
			json.put("error_info", task.get("process_speed"));

			sendMessage(false, json);
		} catch (JSONException e) {
			// No message is sent to the user, JSON failed
			Log.e(LOG_TAG, "onError: " + "JSON exception");
		}
	}

	@Override
	public void onExtract(HashMap<String, String> task) {
		// Log.d(LOG_TAG, "onExtract");

		JSONObject json;
		try {
			json = new JSONObject().put("status", "unzip");
			json.put("url", task.get("url"));
			json.put("progress", task.get("process_progress"));
			json.put("taskName", task.get("taskName"));
			json.put("global_process_speed", task.get("global_process_speed"));
			json.put("global_process_progress",
					task.get("global_process_progress"));

			sendMessage(true, json);
		} catch (JSONException e) {
			// No message is sent to the user, JSON failed
			Log.e(LOG_TAG, "onExtract: " + "JSON exception");
		}
	}

	@Override
	public void onStatus(HashMap<String, String> task) {
		// Log.d(LOG_TAG, "onStatus");

		JSONObject json = new JSONObject();
		try {
			if (task.isEmpty()) {
				json.put("status", "idle");
			} else {
				int status = Integer.parseInt(task.get("type"));
				if (status == 1) {
					json.put("status", "complete");
				} else if (status == 3) {
					json.put("status", "paused");
				} else {
					// Log.d(LOG_TAG, "onStatus: " + status);
				}

				json.put("url", task.get("url"));
			}

			sendMessage(true, json);
		} catch (JSONException e) {
			// No message is sent to the user, JSON failed
			Log.e(LOG_TAG, "onStatus: " + "JSON exception");
		}

	}

	public void onDelete(HashMap<String, String> task) {
		JSONObject json;
		try {
			Log.d("======DELETED=====", "IT's DELETED");
			json = new JSONObject().put("status", "deleted");
			json.put("url", task.get("url"));			
			sendMessage(true, json);
		} catch (JSONException e) {
			// No message is sent to the user, JSON failed
			Log.e(LOG_TAG, "onComplete: " + "JSON exception");
		}
	}
}
