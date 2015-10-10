
package com.symphonyteleca.lrn.catalyst.download.services;

import com.symphonyteleca.lrn.catalyst.download.error.DownloadException;


public interface DownloadTaskListener {


	public void notifyUpdate(DownloadTask task);

	public void notifyFinish(DownloadTask task);

	public void notifyExtract(DownloadTask task);

	public void notifyPreDownload(DownloadTask task);

	public void notifyError(DownloadTask task, DownloadException error);
	
	public void notifyPause(DownloadTask task);

}
