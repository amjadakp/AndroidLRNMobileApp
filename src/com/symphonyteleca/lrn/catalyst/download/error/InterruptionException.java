package com.symphonyteleca.lrn.catalyst.download.error;

public final class InterruptionException extends DownloadException {

	/**
     * 
     */
	private static final long serialVersionUID = 1L;

	public InterruptionException(String message) {

		super(message);
	}

	public InterruptionException(String message, int extra) {

		super(message, extra);
	}

	@Override
	public int getErrorCode() {
		return mExtra;
	}
}
