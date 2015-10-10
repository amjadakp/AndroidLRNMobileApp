package com.symphonyteleca.lrn.catalyst.download.services;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.ArrayList;

import com.symphonyteleca.lrn.catalyst.download.utils.MyIntents;
import com.symphonyteleca.lrn.catalyst.download.utils.StorageUtils;

import android.app.Service;
import android.content.Intent;
import android.graphics.Path;
import android.os.IBinder;
import android.text.TextUtils;
import android.util.Log;

public final class DownloadService extends Service {

	private DownloadManager mDownloadManager;	

	@Override
	public void onCreate() {

		super.onCreate();
		mDownloadManager = new DownloadManager(this);
	}

	@Override
	public void onStart(Intent intent, int startId) {

		super.onStart(intent, startId);

		if (intent != null
				&& intent
						.getAction()
						.equals("com.symphonyteleca.lrn.catalyst.download.services.IDownloadService")) {
			int type = intent.getIntExtra(MyIntents.TYPE, -1);
			//long globalSize;
			String url,path;

			switch (type) {
			case MyIntents.Types.START:
				break;

			case MyIntents.Types.ADD:
			case MyIntents.Types.RESUME:
				url = intent.getStringExtra(MyIntents.URL);
				//globalSize = intent.getLongExtra(MyIntents.SIZE, 0);
				mDownloadManager.addTask(url);  //globalSize
				try {
					Thread.sleep(10);
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
				break;

			case MyIntents.Types.ADDALL:

				@SuppressWarnings("unchecked")
				ArrayList<String> mUrl = (ArrayList<String>) intent.getSerializableExtra(MyIntents.URL);
				//globalSize = intent.getLongExtra(MyIntents.SIZE, 0);
				mDownloadManager.addTask(mUrl); //globalSize
				break;
			case MyIntents.Types.CANCEL:
				url = intent.getStringExtra(MyIntents.URL);
				if (!TextUtils.isEmpty(url)) {
					mDownloadManager.cancelTask(url);
				}
				break;

			case MyIntents.Types.DELETE:
				url = intent.getStringExtra(MyIntents.URL);
				String filePath = StorageUtils.FILE_ROOT ;
				try {
					filePath = filePath + new java.io.File((new URL(url)).getFile()).getName();
					Log.d("Delete File Path" , filePath);
				} catch (MalformedURLException e) {
				}
				if (!TextUtils.isEmpty(filePath)) {
					DownloadManager.deleteTask(this,filePath, url, false);
				}
				break;
			case MyIntents.Types.PAUSE:
				url = intent.getStringExtra(MyIntents.URL);
				if (!TextUtils.isEmpty(url)) {
					mDownloadManager.pauseTask(url);
				}
				break;
			default:
				break;
			}
		}
	}

	@Override
	public IBinder onBind(Intent arg0) {

		return null;
	}
}
