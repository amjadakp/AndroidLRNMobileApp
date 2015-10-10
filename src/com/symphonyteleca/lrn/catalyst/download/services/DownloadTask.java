package com.symphonyteleca.lrn.catalyst.download.services;

import com.symphonyteleca.lrn.catalyst.download.error.DownloadException;
import com.symphonyteleca.lrn.catalyst.download.error.DownloadRuntimeException;
import com.symphonyteleca.lrn.catalyst.download.error.FileExtractionException;
import com.symphonyteleca.lrn.catalyst.download.error.FileExtractionIOException;
import com.symphonyteleca.lrn.catalyst.download.error.MalFormatUrlInterruptException;
import com.symphonyteleca.lrn.catalyst.download.error.NetworkUnAvailableException;
import com.symphonyteleca.lrn.catalyst.download.error.NoMemoryException;
import com.symphonyteleca.lrn.catalyst.download.error.SDCardException;
import com.symphonyteleca.lrn.catalyst.download.error.UnknownHostException;
import com.symphonyteleca.lrn.catalyst.download.error.illegalDownloadStateException;
import com.symphonyteleca.lrn.catalyst.download.http.AndroidHttpClient;
import com.symphonyteleca.lrn.catalyst.download.utils.ConfigUtils;
import com.symphonyteleca.lrn.catalyst.download.utils.MyIntents;
import com.symphonyteleca.lrn.catalyst.download.utils.NetworkUtils;
import com.symphonyteleca.lrn.catalyst.download.utils.StorageUtils;

import org.apache.http.Header;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import android.content.Context;
import android.os.AsyncTask;
import android.util.Log;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.RandomAccessFile;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public final class DownloadTask extends AsyncTask<Void, Integer, Long> {

	public final static int TIME_OUT = 180000;
	private final static int BUFFER_SIZE = 1024 * 8;

	private static final String TAG = "DownloadTask";
	// private static final boolean DEBUG = true;
	private static final String TEMP_SUFFIX = ".download";

	private URL URL;
	private File file;
	private File tempFile;
	private String url;
	private String path;
	private RandomAccessFile outputStream;
	private DownloadTaskListener listener;
	private Context context;
	private long downloadSize;
	private long previousFileSize;
	private long totalSize;
	private long downloadPercent = 0;
	private long networkSpeed;
	private long networkBandWidth;
	private long previousTime;
	private long totalTime;
	private AndroidHttpClient client;
	private HttpGet httpGet;
	private HttpResponse response;
	protected boolean onStatus = true;
	private String taskName = "";
	private String fileName = "";
	protected int downloadStatus = MyIntents.Types.NOT_STARTED;

	public DownloadTask(Context context, String url, String path)
			throws MalFormatUrlInterruptException, SDCardException,
			NoMemoryException, NetworkUnAvailableException,
			FileExtractionIOException, UnknownHostException {

		this(context, url, path, null);
	}

	public DownloadTask(Context context, String url, String path,
			DownloadTaskListener listener) throws SDCardException,
			NoMemoryException, NetworkUnAvailableException,
			MalFormatUrlInterruptException, FileExtractionIOException,
			UnknownHostException {

		super();
		this.path = path;
		this.listener = listener;
		this.context = context;
		this.taskName = "";
		handleException(url);
	}

	public void handleException(String url)
			throws MalFormatUrlInterruptException, SDCardException,
			NoMemoryException, NetworkUnAvailableException,
			FileExtractionIOException, UnknownHostException {
		try {
			this.url = url;
			this.URL = new URL(url);
			this.fileName = new File(URL.getFile()).getName();
			this.file = new File(path, fileName);
			this.tempFile = new File(path, fileName + TEMP_SUFFIX);
			this.taskName = "";

		} catch (MalformedURLException e) {
			e.printStackTrace();
			throw new MalFormatUrlInterruptException("MalformedURLException",
					317);
		}

		if (!StorageUtils.isSDCardPresent()) {

			// ConfigUtils.deleteURL(context, url);

			throw new SDCardException("Please insert SDcard", 301);
		}

		if (!NetworkUtils.isNetworkAvailable(context)) {
			// if (DEBUG) {
			// Log.v(TAG,"Network not available.");
			// }
			if (client != null)
				client.close();
			response = null;
			throw new NetworkUnAvailableException("Network unavailable", 302);
		}

		if (!StorageUtils.isSdCardWrittenable()) {
			if (client != null)
				client.close();
			response = null;
			throw new SDCardException("SDcard is unmounted", 303);
		}

		long storage = StorageUtils.getAvailableStorage();

		if (2 * getcontentSize(url) > storage) {
			if (client != null)
				client.close();
			response = null;
			throw new NoMemoryException(
					"SDcard dont have sufficient memory to save file.", 304);
		}
	}

	private long getcontentSize(String Url) throws FileExtractionIOException,
			NoMemoryException {
		totalSize = getHttpResponse().getEntity().getContentLength();
		if (totalSize < 0) {
			if (client != null)
				client.close();
			response = null;
			throw new NoMemoryException("File exceeds maximum value.", 304);
		}
		DownloadManager.mCacheContentSize.put(Url, totalSize);
		DownloadManager.setGlobalSize(DownloadManager.getContentSize());
		DownloadManager.setPreviousDownloadSize(DownloadManager
				.getPreviousTotalDownloadSize());
		return DownloadManager.mCacheContentSize.get(Url);
	}

	private final class ProgressReportingRandomAccessFile extends
			RandomAccessFile {

		private int progress = 0;

		public ProgressReportingRandomAccessFile(File file, String mode)
				throws FileNotFoundException {

			super(file, mode);
			// if (DEBUG) {
			// Log.v(TAG,"mode = "+mode+"filename = "+file.getName());
			// }
			//
		}

		@Override
		public void write(byte[] buffer, int offset, int count)
				throws IOException {

			super.write(buffer, offset, count);
			progress += count;
			publishProgress(progress);
		}
	}

	public String getUrl() {

		return url;
	}

	public String getFileName() {
		return fileName;
	}

	public String getTaskName() {
		return taskName;
	}

	public void setTaskName(String taskN) {
		taskName = taskN;
	}

	public String getPath() {
		return path;
	}

	public long getDownloadPercent() {

		return downloadPercent;
	}

	public long getDownloadSize() {

		return downloadSize + previousFileSize;
	}

	public long getTotalSize() {

		return totalSize;
	}

	public long getDownloadSpeed() {

		return this.networkSpeed;
	}

	public long getDownloadBandWidth() {

		return this.networkBandWidth;
	}

	public long getTotalTime() {

		return this.totalTime;
	}

	public DownloadTaskListener getListener() {

		return this.listener;
	}

	public void setListenerStatus(boolean setStatus) {
		this.onStatus = setStatus;
	}

	@Override
	protected void onPreExecute() {

		previousTime = System.currentTimeMillis();
	}

	@Override
	protected Long doInBackground(Void... params) {

		long result = -1;
		try {

			result = download();
			if (result != -1) {
				tempFile.renameTo(file);
				// Extract download
				ZiptoFile();
				// Finish download
				if (listener != null)
					listener.notifyFinish(this);
			}

		} catch (DownloadException e) {
			e.printStackTrace();
			result = -1;

			if (listener != null)
				listener.notifyError(this, e);

		}

		catch (Exception e) {
			e.printStackTrace();
			result = -1;

			if (listener != null)
				listener.notifyError(this, null);

		} finally {
			try {
				if (client != null)
					client.close();
				response = null;
			} catch (Exception e) {

			}
		}

		return result;
	}

	@Override
	protected void onProgressUpdate(Integer... progress) {

		if (progress.length <= 1) {
			totalTime = System.currentTimeMillis() - previousTime;
			// if (DEBUG) {
			// Log.v(TAG,"totalTime="+totalTime);
			// }
			downloadSize = progress[0];
			// if (DEBUG) {
			// Log.v(TAG,"downloadSize="+downloadSize);
			// }
			downloadPercent = (getDownloadSize()) * 100 / getTotalSize();
			// if (DEBUG) {
			// Log.v(TAG,"downloadPercent="+downloadPercent);
			// }
			// networkSpeed = downloadSize / totalTime;
			// if (DEBUG) {
			// Log.v(TAG,"networkSpeed="+networkSpeed);
			// }
			try {
				networkSpeed = downloadSize / totalTime;
				long rate = (getDownloadSize() / totalTime);
				networkBandWidth = (getTotalSize() - getDownloadSize()) / rate;
			} catch (Exception e) {
				// TODO: handle exception
				e.printStackTrace();
				if (client != null)
					client.close();
				response = null;
			}

			if (listener != null) {
				listener.notifyUpdate(this);
			}
		}
	}

	public void ZiptoFile() throws FileExtractionException,
			FileExtractionException, FileExtractionIOException {

		String filePath;
		try {
			filePath = file.getCanonicalPath();
		} catch (IOException e) {
			e.printStackTrace();
			throw new FileExtractionIOException(e.getMessage(), 310);
		}
		try {
			file = unzipFile(filePath,
					filePath.substring(0, filePath.lastIndexOf(".zip")));
			DownloadManager.deleteTask(context, filePath, getUrl(), true);
			if (file != null) {
				this.fileName = file.getName();
				totalSize = file.length();
			}
		} catch (NullPointerException e) {
			// TODO: handle exception
			e.printStackTrace();
			if (client != null)
				client.close();
			response = null;
			throw new FileExtractionException(e.getMessage(), 316);
		}
		//
		// if (DEBUG) {
		// Log.v("ZiptoFile()", "this.fileName ="+file.getName()+"totalSize ="+
		// file.length());
		// }
	}

	//
	public File unzipFile(String srcZipFile, String destUnZippedFolder)
			throws FileExtractionException, FileExtractionIOException {

		File destFile = null;
		int count = 0;
		int totalBytes = 0;
		ZipInputStream zin = null;
		String name;
		String fileName1;
		File destinationFilePath;
		FileOutputStream fos = null;
		this.taskName = "unzipping";

		try {
			if (listener != null) {
				listener.notifyExtract(this);
			}
			File destFolder = new File(destUnZippedFolder);
			if (!destFolder.exists())
				createDir(destFolder);

			FileInputStream fin = new FileInputStream(srcZipFile);

			zin = new ZipInputStream(fin);
			ZipEntry zipEntry = null;
			totalBytes = fin.available();
			totalSize = totalBytes;
			// if (DEBUG) {
			// Log.v(TAG,
			// "zin.available()=" + zin.available());
			// }

			if (zin.available() != 0) {

				while ((zipEntry = zin.getNextEntry()) != null) {
					name = zipEntry.getName();
					fileName1 = destUnZippedFolder + "/" + name;
					// Log.d("LRN", "zipName = " + name);
					destinationFilePath = new File(destUnZippedFolder, name);
					destinationFilePath.getParentFile().mkdirs();
					if (zipEntry.isDirectory()) {
						continue;
					}
					destFile = new File(fileName1);
					fos = new FileOutputStream(destFile);
					if (listener != null) {

						listener.notifyExtract(this);
					}
					byte[] buffer = new byte[10240];
					int BytesRead = 0;
					while ((BytesRead = zin.read(buffer, 0, buffer.length)) != -1) {
						fos.write(buffer, 0, BytesRead);
						count += BytesRead;
						downloadPercent = (int) (count * 100) / totalBytes;
						// Log.d("UNZIPPING: "," read=" +count + " total="
						// +totalBytes + " unzip %"+
						// (int)(count*100)/totalBytes);
						// Arrays.fill(buffer, (byte) 0);
					}
					fos.close();
					// if (DEBUG) {
					// Log.v(TAG,"fos.close()");
					// }
					zin.closeEntry();

				}
			}

			zin.close();
		}

		catch (FileNotFoundException e) {
			// if (DEBUG) {
			// Log.v(TAG,"Exception"+e.getMessage());
			// }
			//
			e.printStackTrace();
			throw new FileExtractionException(
					"File not Found while Extracting " + e.getMessage(), 311);
		}

		catch (IOException e) {
			// if (DEBUG) {
			// Log.v(TAG,"Exception"+e.getMessage());
			// }
			//
			e.printStackTrace();
			throw new FileExtractionIOException("IOException while Extracting "
					+ e.getMessage(), 312);
		} finally {
			try {
				if (fos != null)
					fos.close();
				if (zin != null) {
					zin.closeEntry();
					zin.close();
				}
				if (client != null)
					client.close();
				response = null;
			} catch (Exception e) {
			}

		}

		return destFile;
	}

	private void createDir(File dir) throws FileExtractionIOException {
		if (dir.exists()) {
			return;
		}

		if (!dir.mkdirs()) {

			// if (DEBUG) {
			// Log.v(TAG,"Cannot create dir ");
			// }

			throw new FileExtractionIOException(
					"RuntimeException Cannot create directory", 313);
		}
	}

	public DownloadTask CancelTask(boolean removeFile) {

		setListenerStatus(false);
		if (listener != null)
			listener.notifyPause(this);
		if (!super.isCancelled())
			super.cancel(true);
		if (client != null)
			client.close();
		response = null;
		if (removeFile) {
			Log.d("DELETING file for TASK: ", getUrl());
			DownloadManager.deleteTask(context, getPath() + getFileName(),
					getUrl(), false);
		}
		return null;
	}

	private HttpResponse getHttpResponse() throws FileExtractionIOException {
		if (response == null) {
			client = AndroidHttpClient.newInstance("DownloadTask");
			httpGet = new HttpGet(url);
			try {
				response = client.execute(httpGet);
				String getHeaderValue = response.getLastHeader("Content-Type")
						.getValue();
				if (!getHeaderValue.contains("zip"))
					throw new FileExtractionIOException("Request failed", 305);
				if (getHeaderValue.contains("file=")) {
					String fName[] = getHeaderValue.split("=");
					this.fileName = fName[1];
					Log.v("fileName", fileName);
					this.file = new File(path, fileName);
					this.tempFile = new File(path, fileName + TEMP_SUFFIX);
				}
			} catch (Exception e) {
				// if (DEBUG) {
				// Log.v(TAG, "Exception" + e.getMessage());
				// }
				//
				e.printStackTrace();
				response = null;
				client.close();
				throw new FileExtractionIOException("Request failed", 305);
			}
		}
		return response;
	}

	private long download() throws NetworkUnAvailableException,
			NoMemoryException, FileExtractionIOException,
			FileExtractionException, DownloadRuntimeException,
			illegalDownloadStateException, MalFormatUrlInterruptException,
			SDCardException, UnknownHostException {

		// if (DEBUG) {
		// Log.v(TAG, "URL=" + Url);
		// }
		handleException(url);
		/*
		 * check file length
		 */
		if (file.exists() && totalSize == file.length()) {
			// ZiptoFile();
			// setDownloadPercent(100);
			if (listener != null) {
				listener.notifyFinish(this);
			}
			client.close(); // must close client first
			return MyIntents.Types.INTERRUPT;

		} else if (tempFile.exists()) {
			httpGet.addHeader("Range", "bytes=" + tempFile.length() + "-");
			previousFileSize = tempFile.length();
			client.close();
			client = AndroidHttpClient.newInstance("DownloadTask");
			try {
				response = client.execute(httpGet);
			} catch (IOException e) {
				e.printStackTrace();
				if (client != null)
					client.close();
				response = null;
				throw new FileExtractionIOException("Request failed:"
						+ e.getMessage(), 305);
			}
		}

		/*
		 * start download
		 */
		try {
			outputStream = new ProgressReportingRandomAccessFile(tempFile, "rw");
		} catch (FileNotFoundException e) {
			// if (DEBUG) {
			// Log.v(TAG, "Exception" + e.getMessage());
			// }
			e.printStackTrace();
			if (client != null)
				client.close();
			response = null;
			throw new FileExtractionException(e.getMessage(), 306);
		}

		publishProgress(0, (int) totalSize);

		InputStream input;
		int bytesCopied;
		try {
			input = response.getEntity().getContent();
			bytesCopied = copy(input, outputStream);
		} catch (IllegalStateException e) {
			e.printStackTrace();
			throw new illegalDownloadStateException(e.getMessage(), 307);
		} catch (IOException e) {
			e.printStackTrace();
			throw new FileExtractionIOException(e.getMessage(), 308);
		}
		finally{
			if (client != null)
				client.close();
			response = null;
		}

		if ((previousFileSize + bytesCopied) != totalSize && totalSize != -1) {
			if (client != null)
				client.close();
			response = null;
			throw new DownloadRuntimeException("Download incomplete: "
					+ previousFileSize + " + " + bytesCopied + " != "
					+ totalSize, 314);
		}
		if (isCancelled())
			return -1;

		return bytesCopied;

	}

	public int copy(InputStream input, RandomAccessFile out)
			throws NetworkUnAvailableException, DownloadRuntimeException,
			IOException {

		if (input == null || out == null) {
			return -1;
		}

		byte[] buffer = new byte[BUFFER_SIZE];
		BufferedInputStream in=null;
		int count = 0, n = 0;
		
		try {
			

			in = new BufferedInputStream(input, BUFFER_SIZE);

			// if (DEBUG) {
			// Log.v(TAG, "length" + out.length());
			// }
			long errorBlockTimePreviousTime = -1, expireTime = 0;
			//
			// if (DEBUG) {
			// Log.v(TAG, "" + out.length());
			// }
			out.seek(out.length());

			while (!isCancelled()) {
				n = in.read(buffer, 0, BUFFER_SIZE);
				if (n == -1) {
					break;
				}
				out.write(buffer, 0, n);

				count += n;

				/*
				 * check network
				 */
				if (!NetworkUtils.isNetworkAvailable(context)) {
					// if (DEBUG) {
					// Log.v(TAG,"Exception"+e.getMessage());
					// }
					if (client != null)
						client.close();
					response = null;
					throw new NetworkUnAvailableException("Network blocked.",
							302);
				}

				if (networkSpeed == 0) {
					if (errorBlockTimePreviousTime > 0) {
						expireTime = System.currentTimeMillis()
								- errorBlockTimePreviousTime;
						if (expireTime > TIME_OUT) {
							//
							// if (DEBUG) {
							// Log.v(TAG,"Exception"+e.getMessage());
							// }
							if (client != null)
								client.close();
							response = null;
							throw new DownloadRuntimeException(
									"connection time out.", 309);
						}
					} else {
						errorBlockTimePreviousTime = System.currentTimeMillis();
					}
				} else {
					expireTime = 0;
					errorBlockTimePreviousTime = -1;
				}
			}
		} catch (Exception e) {
		} finally {

			try {
				if (out != null)
					out.close();
				if (in != null)
					in.close();
				if (input != null)
					input.close();

				client.close(); // must close client first
				client = null;
				response = null;
			} catch (Exception e) {
			}
		}

		return count;
	}
}
