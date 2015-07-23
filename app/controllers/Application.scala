package controllers

import play.api.libs.concurrent.Akka
import play.api.mvc._
import play.api.Play.current
import akka.actor._
import play.api.libs.json._
import actors._
import messages.WebSocketMessage._
class Application extends Controller {

	val game = Akka.system.actorOf(Props[GameActor], name = "game")

	def index = Action { implicit request =>
			Ok(views.html.index())
	}

	def socket = WebSocket.acceptWithActor[InMessage, OutMessage] { request => wsRef =>
		WebSocketActor.props(wsRef, game)
	}

	def joystick = Action { implicit request =>
		Ok(views.html.joystick())
	}

}



