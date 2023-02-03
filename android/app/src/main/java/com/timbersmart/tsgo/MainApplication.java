package com.timbersmart.tsgo;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.ReactNativeBlobUtil.ReactNativeBlobUtilPackage;
import com.th3rdwave.safeareacontext.SafeAreaContextPackage;
import com.facebook.react.ReactInstanceManager;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.rollbar.RollbarReactNative;
import com.rssignaturecapture.RSSignatureCapturePackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.reactnativecommunity.cameraroll.CameraRollPackage;

import android.content.Context;

import com.facebook.react.PackageList;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.config.ReactFeatureFlags;
import com.facebook.soloader.SoLoader;
import com.timbersmart.tsgo.newarchitecture.MainApplicationReactNativeHost;


import java.lang.reflect.InvocationTargetException;
import java.util.List;

import com.swmansion.gesturehandler.RNGestureHandlerPackage;
import com.microsoft.codepush.react.CodePush;

import android.database.CursorWindow;
import android.provider.Settings;
import android.util.Log;

import java.lang.reflect.Field;

import com.microsoft.appcenter.AppCenter;
import com.microsoft.codepush.react.CodePush;
import com.microsoft.appcenter.analytics.Analytics;
import com.microsoft.appcenter.crashes.Crashes;
import com.microsoft.appcenter.distribute.Distribute;
import com.microsoft.appcenter.distribute.UpdateTrack;

public class MainApplication extends Application implements ReactApplication {

    private final ReactNativeHost mReactNativeHost =
            new ReactNativeHost(this) {
                @Override
                public boolean getUseDeveloperSupport() {
                    return BuildConfig.DEBUG;
                }

                @Override
                protected String getJSBundleFile() {
                    return CodePush.getJSBundleFile();
                }

                @Override
                protected List<ReactPackage> getPackages() {
                    @SuppressWarnings("UnnecessaryLocalVariable")
                    List<ReactPackage> packages = new PackageList(this).getPackages();
                    // Packages that cannot be autolinked yet can be added manually here, for example:
                    // packages.add(new MyReactNativePackage());
                    packages.add(new RNGestureHandlerPackage());
                    packages.add(new RSSignatureCapturePackage());
                    packages.add(new RNCWebViewPackage());
                    //packages.add(new CameraRollPackage());
                    return packages;
                }

                @Override
                protected String getJSMainModuleName() {
                    return "index";
                }
            };

    private final ReactNativeHost mNewArchitectureNativeHost =
            new MainApplicationReactNativeHost(this);


    @Override
    public ReactNativeHost getReactNativeHost() {
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            return mNewArchitectureNativeHost;
          } else {
            return mReactNativeHost;
          }
    }

    @Override
    public void onCreate() {
        super.onCreate();
        // If you opted-in for the New Architecture, we enable the TurboModule system
        ReactFeatureFlags.useTurboModules = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
        RollbarReactNative.init(this, "629d28cd429e45418bff46ad4f527f8d", "production");

        // AppCenter
        AppCenter.setLogLevel(android.util.Log.VERBOSE);
//        AppCenter.setUserId(Settings.Secure.ANDROID_ID);
        Distribute.setListener(new AppCenterDistributeListener());
        Distribute.setUpdateTrack(UpdateTrack.PRIVATE);
        Distribute.setEnabled(true);
        Distribute.disableAutomaticCheckForUpdate();
        AppCenter.start(this, "f06354dc-9dc3-4e3d-9697-9f6460ef0d1f", Distribute.class);
        // AppCenter.setLogLevel(Log.VERBOSE);
        Distribute.checkForUpdate();

        SoLoader.init(this, /* native exopackage */ false);

        initializeFlipper(this, getReactNativeHost().getReactInstanceManager());

        // https://github.com/rt2zz/redux-persist/issues/284
        try {
            Field field = CursorWindow.class.getDeclaredField("sCursorWindowSize");
            field.setAccessible(true);
            field.set(null, 500 * 1024 * 1024); //500MB
        } catch (Exception e) {
            if (BuildConfig.DEBUG) {
                e.printStackTrace();
            }
        }

       
    }

    /**
     * Loads Flipper in React Native templates. Call this in the onCreate method with something like
     * initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
     *
     * @param context
     * @param reactInstanceManager
     */
    private static void initializeFlipper(
            Context context, ReactInstanceManager reactInstanceManager) {
        if (BuildConfig.DEBUG) {
            try {
                /*
                We use reflection here to pick up the class that initializes Flipper,
                since Flipper library is not available in release mode
                 */
                Class<?> aClass = Class.forName("com.timbersmart.tsgo.ReactNativeFlipper");
                aClass
                        .getMethod("initializeFlipper", Context.class, ReactInstanceManager.class)
                        .invoke(null, context, reactInstanceManager);
            } catch (ClassNotFoundException e) {
                e.printStackTrace();
            } catch (NoSuchMethodException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            } catch (InvocationTargetException e) {
                e.printStackTrace();
            }
        }
    }
}
