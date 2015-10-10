package com.symphonyteleca.lrn.catalyst.download.error;

public abstract class DownloadException extends Exception {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	protected int mExtra;

	public DownloadException(String message) {

		super(message);
	}

	public DownloadException(String message, int extra) {

		super(message);
		mExtra = extra;
	}

	public abstract int getErrorCode();
}
