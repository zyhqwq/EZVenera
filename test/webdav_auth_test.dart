import 'dart:convert';
import 'dart:io';

import 'package:flutter_test/flutter_test.dart';
import 'package:webdav_client/webdav_client.dart' as webdav;

void main() {
  test('WebDAV client negotiates Basic authentication', () async {
    final server = await HttpServer.bind(InternetAddress.loopbackIPv4, 0);
    addTearDown(server.close);
    var requestCount = 0;

    server.listen((request) async {
      requestCount += 1;
      final expected = 'Basic ${base64Encode(utf8.encode('user:password'))}';
      if (request.headers.value(HttpHeaders.authorizationHeader) != expected) {
        request.response
          ..statusCode = HttpStatus.unauthorized
          ..headers.set(
            HttpHeaders.wwwAuthenticateHeader,
            'Basic realm="test"',
          );
      } else {
        request.response.statusCode = HttpStatus.ok;
      }
      await request.response.close();
    });

    final client = _client(server.port);
    await client.ping();

    expect(requestCount, 2);
  });

  test('WebDAV client negotiates Digest authentication', () async {
    final server = await HttpServer.bind(InternetAddress.loopbackIPv4, 0);
    addTearDown(server.close);
    var requestCount = 0;
    String? authorization;

    server.listen((request) async {
      requestCount += 1;
      authorization = request.headers.value(HttpHeaders.authorizationHeader);
      if (authorization == null) {
        request.response
          ..statusCode = HttpStatus.unauthorized
          ..headers.set(
            HttpHeaders.wwwAuthenticateHeader,
            'Digest realm="test", nonce="abc123", algorithm=MD5, qop="auth"',
          );
      } else {
        request.response.statusCode = HttpStatus.ok;
      }
      await request.response.close();
    });

    final client = _client(server.port);
    await client.ping();

    expect(requestCount, 2);
    expect(authorization, startsWith('Digest '));
    expect(authorization, contains('username="user"'));
  });

  test('WebDAV client surfaces rejected credentials', () async {
    final server = await HttpServer.bind(InternetAddress.loopbackIPv4, 0);
    addTearDown(server.close);
    var requestCount = 0;

    server.listen((request) async {
      requestCount += 1;
      request.response
        ..statusCode = HttpStatus.unauthorized
        ..headers.set(HttpHeaders.wwwAuthenticateHeader, 'Basic realm="test"');
      await request.response.close();
    });

    final client = _client(server.port);

    await expectLater(client.ping(), throwsA(isA<Exception>()));
    expect(requestCount, 2);
  });
}

webdav.Client _client(int port) {
  return webdav.newClient(
    'http://127.0.0.1:$port/',
    user: 'user',
    password: 'password',
  );
}
