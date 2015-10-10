package com.symphonyteleca.lrn.catalyst.download.activities;

import org.apache.cordova.DroidGap;

import com.symphonyteleca.lrn.catalyst.download.R;


import android.os.Bundle;

public class MainActivity extends DroidGap {
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		super.init();
		//super.setIntegerProperty("splashscreen", R.drawable.splash);
		super.loadUrl("file:///android_asset/www/index.html",5000);
		super.setIntegerProperty("loadUrlTimeoutValue", 60000);
	}

}
