package actors

import akka.actor._
import scala.concurrent.Future
import akka.stream.ActorMaterializer
import akka.stream.scaladsl.{Source, Flow, Sink}
import akka.stream.scaladsl.{FlowGraph,Broadcast,Merge}
import akka.stream.OverflowStrategy.dropHead
import play.api.libs.json._
import play.api.libs.functional.syntax._
import messages.WebSocketMessage._
import actors.WebSocketActor._
import scala.concurrent.duration._

class GameActor extends Actor with ActorLogging {
	implicit val system = context.system
	import system.dispatcher
	implicit val materializer = ActorMaterializer()
	var outs = Set[ActorRef]()

	override def preStart = context.system.eventStream.subscribe(self, classOf[DeadLetter])

	val ball:Ball = Ball(450,225,1,8,20,20)
	val lpaddle:Paddle = Paddle(40,225,20,80)
	val rpaddle:Paddle = Paddle(410,225,20,80)

	val in = Source.actorRef[InMessage](0, dropHead)
	val out = Sink.ignore

	def updatePaddle(im:InMessage, pd:Paddle):Unit = {pd.y = im.posy}

	val source = Flow() {implicit b =>
		import FlowGraph.Implicits._
			val bcast = b.add(Broadcast[InMessage](2))
			val merge = b.add(Merge[InMessage](2))
			val upr = Flow[InMessage].map{i => updatePaddle(i,rpaddle);i}
			val upl = Flow[InMessage].map{i => updatePaddle(i,lpaddle);i}
			val fr = Flow[InMessage].filter(i => i.side.equals("rpaddle"))
			val fl = Flow[InMessage].filter(i => i.side.equals("lpaddle"))

			bcast ~> fr ~> upr ~> merge
			bcast ~> fl ~> upl ~> merge

			(bcast.in, merge.out)
	}

	val sourceRef = (source.runWith(in,out))._1	
	val outSource = Source.actorRef[OutMessage](0, dropHead)

	val outRef = Flow[OutMessage]
		.to(Sink.foreach(o => tellThem(o)))
		.runWith(outSource)
	
	system.scheduler.schedule(0 milliseconds, 16 milliseconds,
		outRef,OutMessage(ball,lpaddle,rpaddle))	
	
	def receive = {
		case DeadLetter(msg,from,to) =>	outs -= to
		case msg: InMessage =>  sourceRef ! msg
		case Subscribe => outs += sender()
	}
	def tellThem(msg:Any): Unit = outs foreach{ _ ! msg}

}


