package com.symphonyteleca.lrn.catalyst.download.error;

public class UnknownHostException extends DownloadException{
	private static final long serialVersionUID = 1L;

	public UnknownHostException(String message) {

		super(message);
	}

	public UnknownHostException(String message, int extra) {
		super(message, extra);
	}

	@Override
	public int getErrorCode() {
		return mExtra;
	}

}
