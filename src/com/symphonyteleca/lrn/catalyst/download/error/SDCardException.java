package com.symphonyteleca.lrn.catalyst.download.error;

public final class SDCardException extends DownloadException {

	private static final long serialVersionUID = 1L;

	public SDCardException(String message) {

		super(message);
	}

	public SDCardException(String message, int extra) {
		super(message, extra);
	}

	@Override
	public int getErrorCode() {
		return mExtra;
	}
}