package com.symphonyteleca.lrn.catalyst.download.error;

public final class illegalDownloadStateException extends DownloadException {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public illegalDownloadStateException(String message) {

		super(message);
	}

	public illegalDownloadStateException(String message, int extra) {
		super(message, extra);
	}

	@Override
	public int getErrorCode() {
		return mExtra;
	}
}
