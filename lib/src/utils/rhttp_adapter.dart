import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:rhttp/rhttp.dart' as rhttp;

/// Dio adapter used by upstream Venera for WebDAV requests.
class RHttpAdapter implements HttpClientAdapter {
  static final Future<void> _initialized = rhttp.Rhttp.init();

  static const _settings = rhttp.ClientSettings(
    redirectSettings: rhttp.RedirectSettings.limited(5),
    timeoutSettings: rhttp.TimeoutSettings(
      connectTimeout: Duration(seconds: 15),
      keepAliveTimeout: Duration(seconds: 60),
      keepAlivePing: Duration(seconds: 30),
    ),
    throwOnStatusCode: false,
  );

  static Future<void> initialize() => _initialized;

  @override
  void close({bool force = false}) {}

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    await initialize();
    final response = await rhttp.Rhttp.request(
      method: rhttp.HttpMethod(options.method),
      url: options.uri.toString(),
      settings: _settings,
      expectBody: rhttp.HttpExpectBody.stream,
      body: requestStream == null ? null : rhttp.HttpBody.stream(requestStream),
      headers: rhttp.HttpHeaders.rawMap(
        Map<String, String>.fromEntries(
          options.headers.entries.map(
            (entry) => MapEntry(entry.key, entry.value.toString().trim()),
          ),
        ),
      ),
    );
    if (response is! rhttp.HttpStreamResponse) {
      throw StateError('Invalid HTTP response type: ${response.runtimeType}');
    }

    final headers = <String, List<String>>{};
    for (final entry in response.headers) {
      headers
          .putIfAbsent(entry.$1.toLowerCase(), () => <String>[])
          .add(entry.$2);
    }
    return ResponseBody(
      response.body,
      response.statusCode,
      headers: headers,
      isRedirect: false,
    );
  }
}
