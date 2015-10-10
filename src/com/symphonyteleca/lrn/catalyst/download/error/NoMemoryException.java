package com.symphonyteleca.lrn.catalyst.download.error;

public final class NoMemoryException extends DownloadException {

	/**
     * 
     */
	private static final long serialVersionUID = 1L;

	public NoMemoryException(String message) {

		super(message);
		// TODO Auto-generated constructor stub
	}

	public NoMemoryException(String message, int extra) {
		super(message, extra);
	}

	@Override
	public int getErrorCode() {
		return mExtra;
	}
}
