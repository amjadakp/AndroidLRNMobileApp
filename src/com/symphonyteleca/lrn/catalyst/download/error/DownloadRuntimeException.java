package com.symphonyteleca.lrn.catalyst.download.error;

public final class DownloadRuntimeException extends DownloadException {

	/**
     * 
     */
	private static final long serialVersionUID = 1L;

	public DownloadRuntimeException(String message) {

		super(message);
	}

	public DownloadRuntimeException(String message, int extra) {

		super(message, extra);

	}

	@Override
	public int getErrorCode() {
		return mExtra;
	}
}
