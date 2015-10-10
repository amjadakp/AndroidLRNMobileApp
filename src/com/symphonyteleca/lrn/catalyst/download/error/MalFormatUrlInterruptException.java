package com.symphonyteleca.lrn.catalyst.download.error;

public final class MalFormatUrlInterruptException extends DownloadException {

	/**
     * 
     */
	private static final long serialVersionUID = 1L;

	public MalFormatUrlInterruptException(String message) {

		super(message);
	}

	public MalFormatUrlInterruptException(String message, int extra) {

		super(message, extra);
	}

	@Override
	public int getErrorCode() {
		return mExtra;
	}
}
