package com.symphonyteleca.lrn.catalyst.download.error;

public final class NetworkUnAvailableException extends DownloadException {

	/**
     * 
     */
	private static final long serialVersionUID = 1L;

	public NetworkUnAvailableException(String message) {

		super(message);
	}

	public NetworkUnAvailableException(String message, int extra) {
		super(message, extra);
	}

	@Override
	public int getErrorCode() {
		return mExtra;
	}
}
