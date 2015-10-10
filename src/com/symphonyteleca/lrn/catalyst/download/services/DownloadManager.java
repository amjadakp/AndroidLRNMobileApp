package com.symphonyteleca.lrn.catalyst.download.services;

import com.symphonyteleca.lrn.catalyst.download.error.FileExtractionIOException;
import com.symphonyteleca.lrn.catalyst.download.error.MalFormatUrlInterruptException;
import com.symphonyteleca.lrn.catalyst.download.error.NetworkUnAvailableException;
import com.symphonyteleca.lrn.catalyst.download.error.NoMemoryException;
import com.symphonyteleca.lrn.catalyst.download.error.SDCardException;
import com.symphonyteleca.lrn.catalyst.download.error.DownloadException;
import com.symphonyteleca.lrn.catalyst.download.error.UnknownHostException;
import com.symphonyteleca.lrn.catalyst.download.utils.ConfigUtils;
import com.symphonyteleca.lrn.catalyst.download.utils.MyIntents;
import com.symphonyteleca.lrn.catalyst.download.utils.NetworkUtils;
import com.symphonyteleca.lrn.catalyst.download.utils.StorageUtils;
import android.accounts.NetworkErrorException;
import android.content.Context;
import android.content.Intent;
import android.content.SyncResult;
import android.os.AsyncTask.Status;
import android.util.Log;

import java.io.File;
import java.net.MalformedURLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.Queue;

public final class DownloadManager {

	private Context mContext;
	private TaskQueue mTaskQueue;
	private DownloadTask task = null;
	private DownloadThread downloadthread;
	private static long totalContentSize;
	private static long totalpreviousDownloadSize;
	protected static HashMap<String, Long> mCacheContentSize = new HashMap<String, Long>();
	protected static HashMap<String, Long> mCacheDownloadedSize = new HashMap<String, Long>();

	public DownloadManager(Context context) {

		mContext = context;
		mTaskQueue = new TaskQueue();
		downloadthread = new DownloadThread();
		StorageUtils.mkdir();
	}

	protected void addTask(String url) { // ,long globalSize) {
		addQueue(url);
	}

	protected void addTask(ArrayList<String> url) { // ,long globalSize) {
		for (String mUrl : url)
			addQueue(mUrl);
	}

	private void addQueue(String Url) { // ,long globalSize) {
		mTaskQueue.offer(Url); // ,long globalSize)
	}

	private void startdownloadThread() {

		if (!downloadthread.isAlive()) {
			downloadthread = new DownloadThread();
			downloadthread.start();
		}
	}

	private void startDownload() {
		while (mTaskQueue.size() != 0) {
			if (task == null
					|| (task.downloadStatus == MyIntents.Types.COMPLETE && task
							.getStatus() == Status.FINISHED)) {
				task = mTaskQueue.poll();
				task.execute();
			}
			try {
				Thread.sleep(1000);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
	}

	protected void cancelTask(String url) {
		mTaskQueue.clearQueue(true);

	}

	protected void pauseTask(String url) {
		mTaskQueue.clearQueue(false);
	}

	private void broadcastError(String mUrl, DownloadException error) {
		HashMap<String, String> map = new HashMap<String, String>();
		map.put(MyIntents.TYPE, "" + MyIntents.Types.EXCEPTION);

		map.put(MyIntents.URL, mUrl);
		map.put(MyIntents.NAME, "");
		map.put(MyIntents.PATH, "");
		map.put(MyIntents.TASKNAME, "");
		if (error != null) {
			map.put(MyIntents.PROCESS_PROGRESS, "" + error.getErrorCode());
			map.put(MyIntents.PROCESS_SPEED, "" + error.getMessage());
		} else {
			map.put(MyIntents.PROCESS_PROGRESS, "316");
			map.put(MyIntents.PROCESS_SPEED,
					"uncaught exception:exception cant be found");
		}
		map.put(MyIntents.GLOBAL_PROCESS_SPEED, "");
		map.put(MyIntents.GLOBAL_PROCESS_PROGRESS, "");
		Intent updateIntent = new Intent(
				"com.symphonyteleca.lrn.catalyst.download.services.PhonegapConnector");
		updateIntent.putExtra(MyIntents.MAP, map.toString());
		mContext.sendBroadcast(updateIntent);
	}

	public static void broadcastDelete(Context mContext, String filePath,
			boolean isDeleted, String url) {
		HashMap<String, String> map = new HashMap<String, String>();
		map.put(MyIntents.TYPE, "" + MyIntents.Types.DELETE);
		map.put(MyIntents.URL, url);
		map.put(MyIntents.NAME, "");
		map.put(MyIntents.PATH, filePath);
		map.put(MyIntents.TASKNAME, "");
		map.put(MyIntents.PROCESS_PROGRESS, "");
		map.put(MyIntents.PROCESS_SPEED, "" + isDeleted);
		map.put(MyIntents.GLOBAL_PROCESS_SPEED, "");
		map.put(MyIntents.GLOBAL_PROCESS_PROGRESS, "");
		Intent updateIntent = new Intent(
				"com.symphonyteleca.lrn.catalyst.download.services.PhonegapConnector");
		updateIntent.putExtra(MyIntents.MAP, map.toString());
		mContext.sendBroadcast(updateIntent);
	}

	public static void deleteTask(Context context, String filePath, String url,
			boolean dotFiles) {
		ConfigUtils.deleteURL(context, filePath);
		boolean isFileDeleted = false;
		File zipfile = new File((filePath));

		if (zipfile.exists())
			zipfile.delete();
		else {
			zipfile = new File((filePath + ".download"));
			if (zipfile.exists())
				zipfile.delete();
		}
		int indexOf = filePath.indexOf(".zip");
		if (indexOf != -1) {
			DeleteRecursive(
					new File(StorageUtils.FILE_ROOT
							+ NetworkUtils.getFileNameFromUrl(filePath
									.substring(0, indexOf))), dotFiles);
		}

		if (!zipfile.exists() || filePath.indexOf(".zip") == -1)
			isFileDeleted = !isFileDeleted;
		if (!dotFiles) {
			broadcastDelete(context, filePath, isFileDeleted, url);
		}

	}

	private static void DeleteRecursive(File fileOrDirectory, boolean dotFiles) {
		if (!dotFiles) {
			if (fileOrDirectory.isDirectory())
				for (File child : fileOrDirectory.listFiles())
					DeleteRecursive(child, dotFiles);
			fileOrDirectory.delete();
		}
	}

	/**
	 * Create a new download task with default config
	 * 
	 * @param url
	 * @return
	 * @throws MalformedURLException
	 * @throws NetworkErrorException
	 * @throws NetworkUnAvailableException
	 * @throws FileExtractionIOException
	 * @throws UnknownHostException
	 */

	private DownloadTask newDownloadTask(String url)
			throws MalFormatUrlInterruptException, SDCardException,
			NoMemoryException, NetworkUnAvailableException,
			FileExtractionIOException, UnknownHostException {

		DownloadTaskListener taskListener = new DownloadTaskListener() {

			@Override
			public void notifyUpdate(DownloadTask task) {

				task.downloadStatus = MyIntents.Types.RESUME;
				HashMap<String, String> map = new HashMap<String, String>();
				map.put(MyIntents.TYPE, "" + task.downloadStatus);
				map.put(MyIntents.PROCESS_SPEED,
						ConfigUtils.getDurationBreakdown(mContext,
								task.getDownloadBandWidth()));
				map.put(MyIntents.PROCESS_PROGRESS, task.getDownloadPercent()
						+ "");
				map.put(MyIntents.GLOBAL_PROCESS_SPEED, ConfigUtils
						.getDurationBreakdown(
								mContext,
								getglobalDownloadBandWidth(
										task.getDownloadBandWidth(),
										task.getDownloadSize(),
										task.getTotalSize())));
				map.put(MyIntents.GLOBAL_PROCESS_PROGRESS,
						getGlobalpercentage(task.getDownloadSize()) + "");
				map.put(MyIntents.URL, task.getUrl());
				map.put(MyIntents.NAME, "");
				map.put(MyIntents.PATH, "");
				map.put(MyIntents.TASKNAME, task.getTaskName());
				Intent updateIntent = new Intent(
						"com.symphonyteleca.lrn.catalyst.download.services.PhonegapConnector");
				updateIntent.putExtra(MyIntents.MAP, map.toString());
				if (task.onStatus)
					mContext.sendBroadcast(updateIntent);

			}

			private long getGlobalpercentage(long getDownloadSize) {
				// TODO Auto-generated method stub
				return ((getPreviousDownloadSize() + getDownloadSize) * 100)
						/ getGlobalSize();
			}

			private long getglobalDownloadBandWidth(long downloadBandWidth,
					long downloadSize, long totalSize) {
				long longvalue;
				if ((longvalue = (totalSize - downloadSize)) > 0)
					longvalue = ((getGlobalSize() - getPreviousDownloadSize() - downloadSize) * downloadBandWidth)
							/ longvalue;
				return longvalue;
			}

			@Override
			public void notifyFinish(DownloadTask task) {

				// This method used for managing downloaded files which can be
				// called through either through javascript or native
				// notify list changed

				task.downloadStatus = MyIntents.Types.COMPLETE;
				mCacheDownloadedSize.put(task.getUrl(), task.getDownloadSize());
				HashMap<String, String> map = new HashMap<String, String>();
				map.put(MyIntents.TYPE, "" + task.downloadStatus);
				map.put(MyIntents.PROCESS_SPEED, "Downloaded");
				map.put(MyIntents.PROCESS_PROGRESS, task.getDownloadPercent()
						+ "");
				map.put(MyIntents.GLOBAL_PROCESS_SPEED, ConfigUtils
						.getDurationBreakdown(
								mContext,
								getglobalDownloadBandWidth(
										task.getDownloadBandWidth(),
										task.getDownloadSize(),
										task.getTotalSize())));
				map.put(MyIntents.GLOBAL_PROCESS_PROGRESS,
						getGlobalpercentage(task.getDownloadSize()) + "");
				map.put(MyIntents.URL, task.getUrl());
				map.put(MyIntents.NAME, task.getFileName());
				map.put(MyIntents.PATH, task.getPath());
				map.put(MyIntents.TASKNAME, task.getTaskName());
				ConfigUtils.storeURL(mContext, task.getUrl(), map.toString());
				Intent updateIntent = new Intent(
						"com.symphonyteleca.lrn.catalyst.download.services.PhonegapConnector");
				updateIntent.putExtra(MyIntents.MAP, map.toString());
				if (task.onStatus)
					mContext.sendBroadcast(updateIntent);
			}

			@Override
			public void notifyExtract(DownloadTask task) {

				task.downloadStatus = MyIntents.Types.EXTRACT;
				mCacheDownloadedSize.put(task.getUrl(), task.getDownloadSize());
				HashMap<String, String> map = new HashMap<String, String>();
				map.put(MyIntents.TYPE, "" + task.downloadStatus);
				map.put(MyIntents.PROCESS_SPEED, " Extracting zip files ");
				map.put(MyIntents.PROCESS_PROGRESS, task.getDownloadPercent()
						+ "");
				map.put(MyIntents.GLOBAL_PROCESS_SPEED, ConfigUtils
						.getDurationBreakdown(
								mContext,
								getglobalDownloadBandWidth(
										task.getDownloadBandWidth(),
										task.getDownloadSize(),
										task.getTotalSize())));
				map.put(MyIntents.GLOBAL_PROCESS_PROGRESS,
						getGlobalpercentage(task.getDownloadSize()) + "");
				map.put(MyIntents.URL, task.getUrl());
				map.put(MyIntents.NAME, "");
				map.put(MyIntents.PATH, "");
				map.put(MyIntents.TASKNAME, task.getTaskName());
				Intent updateIntent = new Intent(
						"com.symphonyteleca.lrn.catalyst.download.services.PhonegapConnector");
				updateIntent.putExtra(MyIntents.MAP, map.toString());
				if (task.onStatus)
					mContext.sendBroadcast(updateIntent);

				// ConfigUtils.storeURL(mContext,task.getUrl(), map.toString());

			}

			@Override
			public void notifyPreDownload(DownloadTask task) {

				// HashMap<String, String> map = new HashMap<String, String>();
				// map.put(MyIntents.TYPE,""+MyIntents.Types.START);
				// map.put(MyIntents.PROCESS_SPEED, task.getDownloadSpeed() +
				// "kbps | " + StorageUtils.size(task.getDownloadSize()) +
				// " of " + StorageUtils.size(task.getTotalSize()));
				// map.put(MyIntents.PROCESS_PROGRESS, task.getDownloadPercent()
				// + "");
				// map.put(MyIntents.URL, task.getUrl());
				// map.put(MyIntents.NAME, "");
				// map.put(MyIntents.PATH, "");
				//
				// ConfigUtils.storeURL(mContext,task.getUrl(), map.toString());

			}

			@Override
			public void notifyError(DownloadTask task, DownloadException error) {

				task.downloadStatus = MyIntents.Types.EXCEPTION;
				mCacheDownloadedSize.put(task.getUrl(), task.getDownloadSize());
				HashMap<String, String> map = new HashMap<String, String>();
				map.put(MyIntents.TYPE, "" + task.downloadStatus);

				map.put(MyIntents.URL, task.getUrl());
				map.put(MyIntents.NAME, "");
				map.put(MyIntents.PATH, "");
				map.put(MyIntents.TASKNAME, task.getTaskName());
				if (error != null) {
					map.put(MyIntents.PROCESS_PROGRESS,
							"" + error.getErrorCode());
					map.put(MyIntents.PROCESS_SPEED, "" + error.getMessage());
				} else {
					map.put(MyIntents.PROCESS_PROGRESS, "316");
					map.put(MyIntents.PROCESS_SPEED,
							"uncaught exception:exception cant be found");
				}
				map.put(MyIntents.GLOBAL_PROCESS_SPEED, ConfigUtils
						.getDurationBreakdown(
								mContext,
								getglobalDownloadBandWidth(
										task.getDownloadBandWidth(),
										task.getDownloadSize(),
										task.getTotalSize())));
				map.put(MyIntents.GLOBAL_PROCESS_PROGRESS,
						getGlobalpercentage(task.getDownloadSize()) + "");
				Intent updateIntent = new Intent(
						"com.symphonyteleca.lrn.catalyst.download.services.PhonegapConnector");
				updateIntent.putExtra(MyIntents.MAP, map.toString());
				if (task.onStatus) {
					mContext.sendBroadcast(updateIntent);
					// onPause(task);
				}
			}

			@Override
			public void notifyPause(DownloadTask task) {

				task.downloadStatus = MyIntents.Types.PAUSE;
				mCacheDownloadedSize.put(task.getUrl(), task.getDownloadSize());
				HashMap<String, String> map = new HashMap<String, String>();
				map.put(MyIntents.TYPE, "" + task.downloadStatus);
				map.put(MyIntents.TASKNAME, task.getTaskName());
				map.put(MyIntents.PROCESS_SPEED,
						StorageUtils.size(task.getDownloadSize()) + " of "
								+ StorageUtils.size(getGlobalSize()));
				map.put(MyIntents.PROCESS_PROGRESS,
						"" + task.getDownloadPercent() + "");
				map.put(MyIntents.GLOBAL_PROCESS_SPEED, ConfigUtils
						.getDurationBreakdown(
								mContext,
								getglobalDownloadBandWidth(
										task.getDownloadBandWidth(),
										task.getDownloadSize(),
										task.getTotalSize())));
				map.put(MyIntents.GLOBAL_PROCESS_PROGRESS,
						getGlobalpercentage(task.getDownloadSize()) + "");
				map.put(MyIntents.NAME, task.getFileName());
				map.put(MyIntents.PATH, task.getPath());
				map.put(MyIntents.URL, task.getUrl());
				if (task.getDownloadSize() != 0)
					ConfigUtils.storeURL(mContext, task.getUrl(),
							map.toString());
			}

		};
		return new DownloadTask(mContext, url, StorageUtils.FILE_ROOT,
				taskListener);
	}

	@Deprecated
	public void continueTask(DownloadTask task) {
		if (task != null) {
			// mTaskQueue.offer(task);
		}
	}

	@Deprecated
	public int getQueueTaskCount() {
		return mTaskQueue.size();
	}

	public static long getContentSize() {
		// TODO Auto-generated method stub
		Iterator<String> iterator = DownloadManager.mCacheContentSize.keySet()
				.iterator();
		long size = 0;
		while (iterator.hasNext())
			size += DownloadManager.mCacheContentSize.get(iterator.next());
		return size;
	}

	public static long getPreviousTotalDownloadSize() {
		Iterator<String> iterator = DownloadManager.mCacheDownloadedSize
				.keySet().iterator();
		long size = 0;
		while (iterator.hasNext())
			size += DownloadManager.mCacheDownloadedSize.get(iterator.next());
		return size;
	}

	public static long getGlobalSize() {

		return totalContentSize;
	}

	public static void setGlobalSize(long ContentSize) {

		totalContentSize = ContentSize;
	}

	public static long getPreviousDownloadSize() {

		return totalpreviousDownloadSize;
	}

	public static void setPreviousDownloadSize(long previousDownloadSize) {

		totalpreviousDownloadSize = previousDownloadSize;
	}

	private class DownloadThread extends Thread {
		@Override
		public void run() {
			startDownload();
		}

	}

	private class TaskQueue {
		private Queue<DownloadTask> taskQueue;
		private Queue<DownloadTask> pausedTaskQueue;

		public TaskQueue() {
			taskQueue = new LinkedList<DownloadTask>();
			pausedTaskQueue = new LinkedList<DownloadTask>();
		}

		public synchronized void offer(final String Url) { // ,long globalSize)

			if (Url != null) {
				new Thread(new Runnable() {
					@Override
					public void run() {
						try {
							taskQueue.offer(newDownloadTask(Url));
							remove();
							startdownloadThread();
						} catch (DownloadException e) {
							e.printStackTrace();
							broadcastError(Url, e);
						}
					}
				}).start();
			}
			// if (task != null)
			// task.setGlobalSize(globalSize);
		}

		public void clearQueue(boolean isRemoveFile) {
			synchronized (mTaskQueue) {
				mCacheContentSize.clear();
				if (isRemoveFile)
					mCacheDownloadedSize.clear();
				if (task != null) {
					if (!isRemoveFile) {
						if (!pausedTaskQueue.contains(task))
							pausedTaskQueue.add(task);
					}
					task.CancelTask(isRemoveFile);
					task = null;
				}
				Iterator<DownloadTask> dtaskQ = taskQueue.iterator();
				while (dtaskQ.hasNext()) {
					task = dtaskQ.next();
					if (task != null) {
						if (!isRemoveFile) {
							if (!pausedTaskQueue.contains(task))
								pausedTaskQueue.add(task);
						}
						task.CancelTask(isRemoveFile);
						task = null;
					}
					dtaskQ.remove();
				}
				dtaskQ = null;
			}
			if (isRemoveFile && pausedTaskQueue.size() > 0) {
				synchronized (pausedTaskQueue) {
					Iterator<DownloadTask> dtaskQ = pausedTaskQueue.iterator();
					while (dtaskQ.hasNext()) {
						task = dtaskQ.next();
						task.CancelTask(isRemoveFile);
						task = null;
						dtaskQ.remove();
					}
					dtaskQ = null;
				}				
			}
		}

		// public void removeTask(boolean isRemoveFile) {
		// if (task != null)
		// task.CancelTask(isRemoveFile);
		// task = null;
		// }

		public DownloadTask poll() {
			return taskQueue.poll();
		}

		public int size() {

			return taskQueue.size();
		}

		public boolean remove() {
			synchronized (pausedTaskQueue) {
				Iterator<DownloadTask> dtaskQ = pausedTaskQueue.iterator();
				while (dtaskQ.hasNext()) {
					task = dtaskQ.next();
					task=null;
					dtaskQ.remove();
				}
			}
			pausedTaskQueue.clear();
			return true;
		}
	}
}
